package com.canonbridge.mappingstudio.outbound;

import com.canonbridge.mappingstudio.credential.CredentialMaterial;
import com.canonbridge.mappingstudio.credential.CredentialMaterialResolver;
import com.canonbridge.mappingstudio.credential.CredentialStoreService;
import com.canonbridge.mappingstudio.domain.Credential;
import com.canonbridge.mappingstudio.domain.OutboundConnection;
import io.smallrye.faulttolerance.api.CircuitBreakerName;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import org.eclipse.microprofile.faulttolerance.CircuitBreaker;
import org.eclipse.microprofile.faulttolerance.Timeout;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class OutboundHttpService {

    private static final int DEFAULT_TIMEOUT_MS = 5000;

    @Inject
    CredentialStoreService credentialStoreService;

    private CredentialMaterialResolver credentialResolver;
    private HttpClient httpClient;

    public OutboundHttpService() {
        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    OutboundHttpService(CredentialMaterialResolver credentialResolver, HttpClient httpClient) {
        this.credentialResolver = credentialResolver;
        this.httpClient = httpClient;
    }

    @PostConstruct
    void init() {
        if (credentialResolver == null) {
            credentialResolver = credentialStoreService;
        }
    }

    @CircuitBreaker(
        requestVolumeThreshold = 10,
        failureRatio = 0.5,
        delay = 30,
        delayUnit = java.time.temporal.ChronoUnit.SECONDS,
        successThreshold = 2
    )
    @CircuitBreakerName("outbound-http")
    @Timeout(value = 10, unit = java.time.temporal.ChronoUnit.SECONDS)
    public Uni<OutboundHttpResult> execute(String tenantId, OutboundConnection connection, OutboundHttpRequest request) {
        if (connection == null) {
            throw new BadRequestException("External system connection is required");
        }
        if (connection.protocol() != OutboundConnection.Protocol.REST
                && connection.protocol() != OutboundConnection.Protocol.SOAP
                && connection.protocol() != OutboundConnection.Protocol.GRAPHQL
                && connection.protocol() != OutboundConnection.Protocol.GRPC) {
            throw new BadRequestException("Only REST, SOAP, GraphQL, and gRPC outbound HTTP connections are supported");
        }

        UUID credentialId = connection.credentialId();
        return credentialResolver.resolve(credentialId, tenantId)
                .chain(credential -> Uni.createFrom().completionStage(() -> send(connection, request, credential)));
    }

    private java.util.concurrent.CompletionStage<OutboundHttpResult> send(
            OutboundConnection connection,
            OutboundHttpRequest outboundRequest,
            CredentialMaterial credential
    ) {
        Instant start = Instant.now();
        HttpRequest request = buildRequest(connection, outboundRequest, credential);
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8))
                .thenApply(response -> toResult(response, start));
    }

    private HttpRequest buildRequest(
            OutboundConnection connection,
            OutboundHttpRequest outboundRequest,
            CredentialMaterial credential
    ) {
        String method = connection.method() != null && !connection.method().isBlank()
                ? connection.method().toUpperCase()
                : defaultMethod(outboundRequest);
        int timeoutMs = connection.timeoutMs() != null ? connection.timeoutMs() : DEFAULT_TIMEOUT_MS;

        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(connection.url()))
                .timeout(Duration.ofMillis(timeoutMs));

        applyHeaders(builder, outboundRequest != null ? outboundRequest.safeHeaders() : new JsonObject());
        applyCredential(builder, credential);

        if (outboundRequest != null && outboundRequest.payload() != null && allowsBody(method)) {
            String body = requestBody(connection, outboundRequest.payload());
            builder.header("Content-Type", contentType(connection.protocol()));
            builder.method(method, HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
        } else {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        }

        return builder.build();
    }

    private void applyHeaders(HttpRequest.Builder builder, JsonObject headers) {
        for (String headerName : headers.fieldNames()) {
            Object value = headers.getValue(headerName);
            if (value != null) {
                builder.header(headerName, String.valueOf(value));
            }
        }
    }

    private void applyCredential(HttpRequest.Builder builder, CredentialMaterial credential) {
        if (credential == null) {
            System.out.println("DEBUG: No credential provided");
            return;
        }

        System.out.println("DEBUG: Applying credential - authType: " + credential.authType());
        JsonObject secret = credential.secret();
        System.out.println("DEBUG: Secret JSON: " + secret.encode());
        switch (credential.authType()) {
            case API_KEY -> {
                String headerName = secret.getString("headerName", "X-API-Key");
                String apiKey = requireSecret(secret, "apiKey");
                System.out.println("DEBUG: Setting API key header - name: " + headerName + ", value: " + apiKey);
                builder.header(headerName, apiKey);
            }
            case BASIC_AUTH -> {
                String username = requireSecret(secret, "username");
                String password = requireSecret(secret, "password");
                String encoded = Base64.getEncoder().encodeToString((username + ":" + password).getBytes(StandardCharsets.UTF_8));
                builder.header("Authorization", "Basic " + encoded);
            }
            case BEARER_TOKEN -> builder.header("Authorization", "Bearer " + requireSecret(secret, "token"));
            case OAUTH2_CLIENT_CREDENTIALS -> builder.header("Authorization", "Bearer " + fetchOAuth2AccessToken(secret));
        }
    }

    private String fetchOAuth2AccessToken(JsonObject secret) {
        String tokenUrl = requireSecret(secret, "tokenUrl");
        String clientId = requireSecret(secret, "clientId");
        String clientSecret = requireSecret(secret, "clientSecret");

        String formBody = Map.of(
                        "grant_type", "client_credentials",
                        "client_id", clientId,
                        "client_secret", clientSecret,
                        "scope", secret.getString("scope", "")
                )
                .entrySet()
                .stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .map(entry -> urlEncode(entry.getKey()) + "=" + urlEncode(entry.getValue()))
                .collect(Collectors.joining("&"));

        HttpRequest tokenRequest = HttpRequest.newBuilder(URI.create(tokenUrl))
                .timeout(Duration.ofMillis(secret.getInteger("tokenTimeoutMs", DEFAULT_TIMEOUT_MS)))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(formBody, StandardCharsets.UTF_8))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(tokenRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BadRequestException("OAuth2 token endpoint returned " + response.statusCode());
            }
            JsonObject tokenResponse = new JsonObject(response.body());
            String accessToken = tokenResponse.getString("access_token");
            if (accessToken == null || accessToken.isBlank()) {
                throw new BadRequestException("OAuth2 token response did not include access_token");
            }
            return accessToken;
        } catch (IOException e) {
            throw new BadRequestException("OAuth2 token endpoint request failed");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("OAuth2 token endpoint request was interrupted");
        }
    }

    private OutboundHttpResult toResult(HttpResponse<String> response, Instant start) {
        JsonObject headers = new JsonObject();
        response.headers().map().forEach((name, values) -> headers.put(name, String.join(",", values)));
        int statusCode = response.statusCode();
        return new OutboundHttpResult(
                statusCode,
                statusCode >= 200 && statusCode < 300,
                Duration.between(start, Instant.now()).toMillis(),
                headers,
                response.body()
        );
    }

    private String defaultMethod(OutboundHttpRequest outboundRequest) {
        return outboundRequest != null && outboundRequest.payload() != null ? "POST" : "GET";
    }

    private String contentType(OutboundConnection.Protocol protocol) {
        if (protocol == OutboundConnection.Protocol.SOAP) {
            return "text/xml; charset=utf-8";
        }
        if (protocol == OutboundConnection.Protocol.GRPC) {
            return "application/grpc+json";
        }
        return "application/json";
    }

    private String requestBody(OutboundConnection connection, JsonObject payload) {
        if (connection.protocol() != OutboundConnection.Protocol.SOAP) {
            return payload.encode();
        }

        String operation = payload.getString("operation", connection.url() != null && connection.url().contains("/create")
                ? "CreateShipment"
                : "TrackShipment");
        if ("CreateShipment".equalsIgnoreCase(operation)) {
            String reference = payload.getString("reference", "REF-DEMO-001");
            return """
                    <?xml version="1.0" encoding="UTF-8"?>
                    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:fc="http://fastcargo.com/tracking">
                        <soap:Body>
                            <fc:CreateShipmentRequest>
                                <fc:reference>%s</fc:reference>
                            </fc:CreateShipmentRequest>
                        </soap:Body>
                    </soap:Envelope>
                    """.formatted(escapeXml(reference));
        }

        String trackingNumber = payload.getString("trackingNumber", "TRK-DEMO-001");
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:fc="http://fastcargo.com/tracking">
                    <soap:Body>
                        <fc:TrackShipmentRequest>
                            <fc:trackingNumber>%s</fc:trackingNumber>
                        </fc:TrackShipmentRequest>
                    </soap:Body>
                </soap:Envelope>
                """.formatted(escapeXml(trackingNumber));
    }

    private String escapeXml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private boolean allowsBody(String method) {
        return !"GET".equals(method) && !"HEAD".equals(method) && !"DELETE".equals(method);
    }

    private String requireSecret(JsonObject secret, String fieldName) {
        String value = secret.getString(fieldName);
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Credential secret is missing required field: " + fieldName);
        }
        return value;
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
