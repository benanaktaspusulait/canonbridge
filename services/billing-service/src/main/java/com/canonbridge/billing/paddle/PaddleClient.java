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
        return config.apiKey().isPresent() && !config.apiKey().get().isBlank();
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

    // =========================================================================
    // Transactions (Checkout)
    // =========================================================================

    /**
     * Create a Paddle transaction to generate a checkout URL.
     * The frontend redirects the user to this URL to complete payment.
     */
    @org.eclipse.microprofile.faulttolerance.CircuitBreaker(requestVolumeThreshold = 5, failureRatio = 0.5, delay = 30, delayUnit = java.time.temporal.ChronoUnit.SECONDS)
    @org.eclipse.microprofile.faulttolerance.Timeout(value = 15, unit = java.time.temporal.ChronoUnit.SECONDS)
    public Uni<String> createCheckoutUrl(UUID orgId, String planCode, String billingCycle, String returnUrl) {
        if (!isConfigured()) {
            String placeholder = String.format(
                "https://sandbox-checkout.paddle.com/checkout?plan=%s&cycle=%s&org=%s",
                planCode, billingCycle, orgId
            );
            Log.infof("[Paddle Mock] Checkout URL: %s", placeholder);
            return Uni.createFrom().item(placeholder);
        }

        String priceId = resolvePriceId(planCode, billingCycle);

        ObjectNode body = objectMapper.createObjectNode();
        ArrayNode items = body.putArray("items");
        ObjectNode item = items.addObject();
        item.put("price_id", priceId);
        item.put("quantity", 1);

        ObjectNode customData = body.putObject("custom_data");
        customData.put("org_id", orgId.toString());
        customData.put("plan_code", planCode);

        if (returnUrl != null && !returnUrl.isBlank()) {
            ObjectNode checkout = body.putObject("checkout");
            checkout.put("url", returnUrl);
        }

        return post("/transactions", body)
            .map(response -> {
                JsonNode data = response.path("data");
                String checkoutUrl = data.path("checkout").path("url").asText(null);
                if (checkoutUrl == null) {
                    checkoutUrl = String.format("https://checkout.paddle.com/transaction/%s", data.path("id").asText());
                }
                Log.infof("Paddle checkout created for org %s: %s", orgId, checkoutUrl);
                return checkoutUrl;
            });
    }

    // =========================================================================
    // Subscriptions
    // =========================================================================

    /**
     * Get a subscription from Paddle.
     */
    public Uni<JsonNode> getSubscription(String subscriptionId) {
        if (!isConfigured()) {
            ObjectNode mock = objectMapper.createObjectNode();
            mock.put("id", subscriptionId);
            mock.put("status", "active");
            return Uni.createFrom().item(mock);
        }
        return get("/subscriptions/" + subscriptionId).map(r -> r.path("data"));
    }

    /**
     * Update a subscription (change plan/price).
     */
    @org.eclipse.microprofile.faulttolerance.Timeout(value = 15, unit = java.time.temporal.ChronoUnit.SECONDS)
    public Uni<Boolean> updateSubscription(String subscriptionId, String newPlanCode, String billingCycle) {
        if (!isConfigured()) {
            Log.infof("[Paddle Mock] Updated subscription %s to %s/%s", subscriptionId, newPlanCode, billingCycle);
            return Uni.createFrom().item(true);
        }

        String priceId = resolvePriceId(newPlanCode, billingCycle);

        ObjectNode body = objectMapper.createObjectNode();
        ArrayNode items = body.putArray("items");
        ObjectNode item = items.addObject();
        item.put("price_id", priceId);
        item.put("quantity", 1);
        body.put("proration_billing_mode", "prorated_immediately");

        return patch("/subscriptions/" + subscriptionId, body)
            .map(response -> {
                Log.infof("Paddle subscription %s updated to %s", subscriptionId, newPlanCode);
                return true;
            })
            .onFailure().recoverWithItem(error -> {
                Log.errorf(error, "Failed to update Paddle subscription %s", subscriptionId);
                return false;
            });
    }

    /**
     * Cancel a subscription in Paddle (effective at end of billing period).
     */
    @org.eclipse.microprofile.faulttolerance.Timeout(value = 15, unit = java.time.temporal.ChronoUnit.SECONDS)
    public Uni<Boolean> cancelSubscription(String subscriptionId) {
        if (!isConfigured()) {
            Log.infof("[Paddle Mock] Canceled subscription %s", subscriptionId);
            return Uni.createFrom().item(true);
        }

        ObjectNode body = objectMapper.createObjectNode();
        body.put("effective_from", "next_billing_period");

        return post("/subscriptions/" + subscriptionId + "/cancel", body)
            .map(response -> {
                Log.infof("Paddle subscription %s canceled", subscriptionId);
                return true;
            })
            .onFailure().recoverWithItem(error -> {
                Log.errorf(error, "Failed to cancel Paddle subscription %s", subscriptionId);
                return false;
            });
    }

    /**
     * Pause a subscription in Paddle.
     */
    @org.eclipse.microprofile.faulttolerance.Timeout(value = 15, unit = java.time.temporal.ChronoUnit.SECONDS)
    public Uni<Boolean> pauseSubscription(String subscriptionId) {
        if (!isConfigured()) {
            Log.infof("[Paddle Mock] Paused subscription %s", subscriptionId);
            return Uni.createFrom().item(true);
        }

        ObjectNode body = objectMapper.createObjectNode();
        body.put("effective_from", "next_billing_period");
        body.putNull("resume_at");

        return post("/subscriptions/" + subscriptionId + "/pause", body)
            .map(response -> {
                Log.infof("Paddle subscription %s paused", subscriptionId);
                return true;
            })
            .onFailure().recoverWithItem(error -> {
                Log.errorf(error, "Failed to pause Paddle subscription %s", subscriptionId);
                return false;
            });
    }

    /**
     * Resume a paused subscription.
     */
    @org.eclipse.microprofile.faulttolerance.Timeout(value = 15, unit = java.time.temporal.ChronoUnit.SECONDS)
    public Uni<Boolean> resumeSubscription(String subscriptionId) {
        if (!isConfigured()) {
            Log.infof("[Paddle Mock] Resumed subscription %s", subscriptionId);
            return Uni.createFrom().item(true);
        }

        ObjectNode body = objectMapper.createObjectNode();
        body.put("effective_from", "immediately");

        return post("/subscriptions/" + subscriptionId + "/resume", body)
            .map(response -> {
                Log.infof("Paddle subscription %s resumed", subscriptionId);
                return true;
            })
            .onFailure().recoverWithItem(error -> {
                Log.errorf(error, "Failed to resume Paddle subscription %s", subscriptionId);
                return false;
            });
    }

    /**
     * Create a customer portal session URL.
     */
    public Uni<String> createCustomerPortalUrl(String customerId) {
        if (!isConfigured()) {
            return Uni.createFrom().item("https://sandbox-customer-portal.paddle.com/portal/" + customerId);
        }

        // Paddle doesn't have a direct portal URL API — use the customer portal link from dashboard
        // For now, construct from base URL
        return Uni.createFrom().item(
            config.baseUrl().replace("api", "customer-portal") + "/" + customerId
        );
    }

    // =========================================================================
    // HTTP Helpers
    // =========================================================================

    private Uni<JsonNode> get(String path) {
        return webClient.get(path)
            .putHeader("Authorization", "Bearer " + config.apiKey().orElse(""))
            .putHeader("Content-Type", "application/json")
            .send()
            .map(this::parseResponse);
    }

    private Uni<JsonNode> post(String path, ObjectNode body) {
        return webClient.post(path)
            .putHeader("Authorization", "Bearer " + config.apiKey().orElse(""))
            .putHeader("Content-Type", "application/json")
            .sendBuffer(Buffer.buffer(body.toString()))
            .map(this::parseResponse);
    }

    private Uni<JsonNode> patch(String path, ObjectNode body) {
        return webClient.patch(path)
            .putHeader("Authorization", "Bearer " + config.apiKey().orElse(""))
            .putHeader("Content-Type", "application/json")
            .sendBuffer(Buffer.buffer(body.toString()))
            .map(this::parseResponse);
    }

    private JsonNode parseResponse(HttpResponse<Buffer> response) {
        try {
            String responseBody = response.bodyAsString();
            if (response.statusCode() >= 400) {
                Log.errorf("Paddle API error %d: %s", response.statusCode(), responseBody);
                throw new PaddleApiException(response.statusCode(), responseBody);
            }
            return objectMapper.readTree(responseBody);
        } catch (PaddleApiException e) {
            throw e;
        } catch (Exception e) {
            throw new PaddleApiException(500, "Failed to parse Paddle response: " + e.getMessage());
        }
    }

    // =========================================================================
    // Price ID Resolution
    // =========================================================================

    /**
     * Resolve a Paddle price ID from plan code and billing cycle.
     * In production, these would be stored in the database or config.
     * For now, uses a naming convention: pri_{planCode}_{cycle}
     */
    private String resolvePriceId(String planCode, String billingCycle) {
        // TODO: Load from database (paddle_price_mappings table) or config
        // Convention: configured via environment or DB
        String key = String.format("PADDLE_PRICE_%s_%s", planCode.toUpperCase(), billingCycle.toUpperCase());
        String priceId = System.getenv(key);
        if (priceId != null && !priceId.isBlank()) {
            return priceId;
        }
        // Fallback: sandbox placeholder
        return String.format("pri_%s_%s", planCode, billingCycle);
    }

    private String extractHost(String url) {
        return url.replaceAll("https?://", "").split("/")[0].split(":")[0];
    }

    // =========================================================================
    // Exception
    // =========================================================================

    public static class PaddleApiException extends RuntimeException {
        private final int statusCode;
        private final String responseBody;

        public PaddleApiException(int statusCode, String responseBody) {
            super("Paddle API error " + statusCode + ": " + responseBody);
            this.statusCode = statusCode;
            this.responseBody = responseBody;
        }

        public int getStatusCode() { return statusCode; }
        public String getResponseBody() { return responseBody; }
    }
}
