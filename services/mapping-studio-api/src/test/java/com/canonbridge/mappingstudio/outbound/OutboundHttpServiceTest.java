package com.canonbridge.mappingstudio.outbound;

import com.canonbridge.mappingstudio.credential.CredentialMaterial;
import com.canonbridge.mappingstudio.domain.Credential;
import com.canonbridge.mappingstudio.domain.OutboundConnection;
import com.sun.net.httpserver.HttpServer;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OutboundHttpServiceTest {

    @Test
    void appliesApiKeyCredentialWhenExecutingConnection() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/orders", exchange -> {
            String apiKey = exchange.getRequestHeaders().getFirst("X-Partner-Key");
            byte[] response = new JsonObject()
                    .put("apiKey", apiKey)
                    .put("method", exchange.getRequestMethod())
                    .encode()
                    .getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(201, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();

        try {
            String tenantId = "tenant-acme";
            UUID credentialId = UUID.randomUUID();
            CredentialMaterial credential = new CredentialMaterial(
                    credentialId,
                    tenantId,
                    Credential.AuthType.API_KEY,
                    Credential.Environment.SANDBOX,
                    new JsonObject()
                            .put("headerName", "X-Partner-Key")
                            .put("apiKey", "partner-secret")
            );
            OutboundHttpService service = new OutboundHttpService(
                    (id, tenant) -> Uni.createFrom().item(credential),
                    HttpClient.newHttpClient()
            );
            OutboundConnection connection = new OutboundConnection(
                    UUID.randomUUID(),
                    tenantId,
                    null,
                    "Partner API",
                    OutboundConnection.ConnectionPurpose.DESTINATION,
                    OutboundConnection.Protocol.REST,
                    "POST",
                    "http://localhost:" + server.getAddress().getPort() + "/orders",
                    credentialId,
                    Credential.Environment.SANDBOX,
                    null,
                    3000,
                    null,
                    null,
                    OutboundConnection.ConnectionStatus.NOT_TESTED,
                    null,
                    null,
                    null,
                    null
            );

            OutboundHttpResult result = service.execute(
                    tenantId,
                    connection,
                    new OutboundHttpRequest(new JsonObject().put("orderId", "A-100"), null)
            ).await().indefinitely();

            assertEquals(201, result.statusCode());
            assertTrue(result.success());
            JsonObject body = new JsonObject(result.body());
            assertEquals("partner-secret", body.getString("apiKey"));
            assertEquals("POST", body.getString("method"));
        } finally {
            server.stop(0);
        }
    }

    @Test
    void fetchesOAuth2TokenBeforeCallingBearerProtectedConnection() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        AtomicInteger tokenRequestCount = new AtomicInteger();
        AtomicReference<String> tokenRequestBody = new AtomicReference<>();
        AtomicReference<String> apiAuthorization = new AtomicReference<>();

        server.createContext("/oauth/token", exchange -> {
            tokenRequestCount.incrementAndGet();
            tokenRequestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] response = new JsonObject()
                    .put("access_token", "issued-token")
                    .put("token_type", "Bearer")
                    .put("expires_in", 3600)
                    .encode()
                    .getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.createContext("/graphql", exchange -> {
            apiAuthorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            int status = "Bearer issued-token".equals(apiAuthorization.get()) ? 200 : 401;
            byte[] response = new JsonObject().put("ok", status == 200).encode().getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(status, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();

        try {
            String tenantId = "tenant-acme";
            UUID credentialId = UUID.randomUUID();
            int port = server.getAddress().getPort();
            CredentialMaterial credential = new CredentialMaterial(
                    credentialId,
                    tenantId,
                    Credential.AuthType.OAUTH2_CLIENT_CREDENTIALS,
                    Credential.Environment.SANDBOX,
                    new JsonObject()
                            .put("clientId", "mock-client")
                            .put("clientSecret", "mock-secret")
                            .put("tokenUrl", "http://localhost:" + port + "/oauth/token")
                            .put("scope", "graphql:query")
            );
            OutboundHttpService service = new OutboundHttpService(
                    (id, tenant) -> Uni.createFrom().item(credential),
                    HttpClient.newHttpClient()
            );
            OutboundConnection connection = new OutboundConnection(
                    UUID.randomUUID(),
                    tenantId,
                    null,
                    "ProfileHub GraphQL API",
                    OutboundConnection.ConnectionPurpose.SOURCE_PAYLOAD,
                    OutboundConnection.Protocol.GRAPHQL,
                    "POST",
                    "http://localhost:" + port + "/graphql",
                    credentialId,
                    Credential.Environment.SANDBOX,
                    null,
                    3000,
                    null,
                    null,
                    OutboundConnection.ConnectionStatus.NOT_TESTED,
                    null,
                    null,
                    null,
                    null
            );

            OutboundHttpResult result = service.execute(
                    tenantId,
                    connection,
                    new OutboundHttpRequest(new JsonObject().put("query", "{ customer { id } }"), null)
            ).await().indefinitely();

            assertEquals(200, result.statusCode());
            assertTrue(result.success());
            assertEquals(1, tokenRequestCount.get());
            assertTrue(tokenRequestBody.get().contains("grant_type=client_credentials"));
            assertTrue(tokenRequestBody.get().contains("client_id=mock-client"));
            assertTrue(tokenRequestBody.get().contains("scope=graphql%3Aquery"));
            assertEquals("Bearer issued-token", apiAuthorization.get());
        } finally {
            server.stop(0);
        }
    }
}
