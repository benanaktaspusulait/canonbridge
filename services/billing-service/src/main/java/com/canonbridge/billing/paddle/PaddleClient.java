package com.canonbridge.billing.paddle;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.core.buffer.Buffer;
import io.vertx.mutiny.ext.web.client.HttpResponse;
import io.vertx.mutiny.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Map;
import java.util.UUID;

/**
 * HTTP client for Paddle Billing API v2.
 *
 * Paddle API docs: https://developer.paddle.com/api-reference/overview
 *
 * When PADDLE_API_KEY is not configured, all methods return sandbox/mock responses
 * to allow local development without a Paddle account.
 */
@ApplicationScoped
public class PaddleClient {

    @Inject
    PaddleConfig config;

    @Inject
    Vertx vertx;

    @Inject
    ObjectMapper objectMapper;

    private WebClient webClient;

    @PostConstruct
    void init() {
        String host = extractHost(config.baseUrl());
        int port = config.baseUrl().startsWith("https") ? 443 : 80;

        WebClientOptions options = new WebClientOptions()
            .setDefaultHost(host)
            .setDefaultPort(port)
            .setSsl(port == 443)
            .setTrustAll(false)
            .setConnectTimeout(10000)
            .setIdleTimeout(30);

        webClient = WebClient.create(vertx, options);
    }

    private boolean isConfigured() {
        return config.apiKey() != null && !config.apiKey().isBlank();
    }

    // =========================================================================
    // Customers
    // =========================================================================

    /**
     * Create a Paddle customer for an organization.
     * Returns the Paddle customer ID.
     */
    public Uni<String> createCustomer(UUID orgId, String email, String name) {
        if (!isConfigured()) {
            String mockId = "ctm_mock_" + orgId.toString().substring(0, 8);
            Log.infof("[Paddle Mock] Created customer: %s", mockId);
            return Uni.createFrom().item(mockId);
        }

        ObjectNode body = objectMapper.createObjectNode();
        body.put("email", email);
        body.put("name", name);
        ObjectNode customData = body.putObject("custom_data");
        customData.put("org_id", orgId.toString());

        return post("/customers", body)
            .map(response -> {
                JsonNode data = response.path("data");
                String customerId = data.path("id").asText();
                Log.infof("Paddle customer created: %s for org %s", customerId, orgId);
                return customerId;
            });
    }

    /**
     * Get a Paddle customer by ID.
     */
    public Uni<JsonNode> getCustomer(String customerId) {
        if (!isConfigured()) {
            return Uni.createFrom().item(objectMapper.createObjectNode().put("id", customerId));
        }
        return get("/customers/" + customerId).map(r -> r.path("data"));
    }
