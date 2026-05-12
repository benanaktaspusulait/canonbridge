package com.canonbridge.outbound.service;

import com.canonbridge.outbound.domain.CallHistory;
import com.canonbridge.outbound.domain.OutboundConnection;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.ext.web.client.WebClient;
import io.vertx.mutiny.ext.web.client.HttpRequest;
import io.vertx.mutiny.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClientOptions;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.faulttolerance.CircuitBreaker;
import org.eclipse.microprofile.faulttolerance.Retry;
import org.eclipse.microprofile.faulttolerance.Timeout;
import org.jboss.logging.Logger;

import java.net.URI;
import java.time.Instant;
import java.util.UUID;

@ApplicationScoped
public class OutboundCallService {

    private static final Logger LOG = Logger.getLogger(OutboundCallService.class);

    @Inject
    Vertx vertx;

    @Inject
    UrlValidationService urlValidationService;

    private WebClient webClient;

    public void init() {
        WebClientOptions options = new WebClientOptions()
            .setFollowRedirects(false)
            .setTrustAll(false)
            .setVerifyHost(true);
        this.webClient = WebClient.create(vertx, options);
    }

    @Retry(maxRetries = 3, delay = 1000)
    @Timeout(value = 30000)
    @CircuitBreaker(requestVolumeThreshold = 10, failureRatio = 0.5, delay = 60000)
    public Uni<CallHistory> executeCall(
            String tenantId,
            OutboundConnection connection,
            String method,
            String path,
            JsonObject headers,
            JsonObject body,
            String correlationId) {

        if (webClient == null) {
            init();
        }

        long startTime = System.currentTimeMillis();
        CallHistory history = new CallHistory();
        history.setId(UUID.randomUUID());
        history.setTenantId(tenantId);
        history.setConnectionId(connection.getId());
        history.setCorrelationId(correlationId);
        history.setMethod(method);
        history.setCreatedAt(Instant.now());

        String fullUrl = connection.getBaseUrl() + (path != null ? path : "");
        history.setUrl(fullUrl);

        // Validate URL
        return urlValidationService.validateUrl(fullUrl)
            .flatMap(valid -> {
                if (!valid) {
                    history.setSuccess(false);
                    history.setErrorMessage("URL validation failed: private IP or not in allowlist");
                    history.setDurationMs(System.currentTimeMillis() - startTime);
                    return Uni.createFrom().item(history);
                }

                try {
                    URI uri = new URI(fullUrl);
                    HttpRequest<io.vertx.mutiny.core.buffer.Buffer> request = webClient
                        .request(io.vertx.core.http.HttpMethod.valueOf(method.toUpperCase()), 
                                uri.getPort() > 0 ? uri.getPort() : (uri.getScheme().equals("https") ? 443 : 80),
                                uri.getHost(),
                                uri.getPath() + (uri.getQuery() != null ? "?" + uri.getQuery() : ""))
                        .timeout(connection.getTimeoutMs());

                    // Add headers
                    if (headers != null) {
                        headers.forEach(entry -> {
                            request.putHeader(entry.getKey(), entry.getValue().toString());
                        });
                    }

                    // Execute request
                    Uni<HttpResponse<io.vertx.mutiny.core.buffer.Buffer>> responseUni;
                    if (body != null && !method.equalsIgnoreCase("GET")) {
                        responseUni = request.sendJsonObject(body);
                    } else {
                        responseUni = request.send();
                    }

                    return responseUni
                        .map(response -> {
                            history.setResponseStatus(response.statusCode());
                            history.setSuccess(response.statusCode() >= 200 && response.statusCode() < 300);
                            history.setResponseBodyMasked(maskSensitiveData(response.bodyAsString()));
                            history.setDurationMs(System.currentTimeMillis() - startTime);
                            return history;
                        })
                        .onFailure().recoverWithItem(throwable -> {
                            LOG.error("Outbound call failed", throwable);
                            history.setSuccess(false);
                            history.setErrorMessage(throwable.getMessage());
                            history.setDurationMs(System.currentTimeMillis() - startTime);
                            return history;
                        });

                } catch (Exception e) {
                    LOG.error("Failed to parse URL or execute request", e);
                    history.setSuccess(false);
                    history.setErrorMessage(e.getMessage());
                    history.setDurationMs(System.currentTimeMillis() - startTime);
                    return Uni.createFrom().item(history);
                }
            });
    }

    private String maskSensitiveData(String data) {
        if (data == null || data.isEmpty()) {
            return data;
        }
        // Simple masking - in production, use proper field-level masking
        if (data.length() > 500) {
            return data.substring(0, 500) + "... [truncated]";
        }
        return data;
    }
}
