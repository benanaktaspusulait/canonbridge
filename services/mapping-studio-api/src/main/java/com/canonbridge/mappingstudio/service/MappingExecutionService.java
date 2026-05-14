package com.canonbridge.mappingstudio.service;

import com.canonbridge.mappingstudio.domain.MappingDraft;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import io.vertx.mutiny.core.buffer.Buffer;
import io.vertx.mutiny.ext.web.client.HttpResponse;
import io.vertx.mutiny.ext.web.client.WebClient;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.HttpHeaders;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for executing mappings as API proxy
 * 
 * Handles the complete flow:
 * 1. Request transformation (original → target API format)
 * 2. External API call
 * 3. Response transformation (target API → original format)
 */
@ApplicationScoped
public class MappingExecutionService {

    private static final Logger LOG = Logger.getLogger(MappingExecutionService.class);

    @Inject
    WebClient webClient;

    @Inject
    ObjectMapper objectMapper;

    @ConfigProperty(name = "canonbridge.transformer.url", defaultValue = "http://localhost:8083")
    String transformerUrl;

    /**
     * Execute a mapping end-to-end
     */
    public Uni<ExecutionResult> executeMapping(
            MappingDraft mapping,
            String requestPayload,
            HttpHeaders headers) {

        LOG.infof("📥 Starting mapping execution for: %s", mapping.getName());

        try {
            JsonNode requestJson = objectMapper.readTree(requestPayload);

            // Step 1: Apply request transformation
            return applyRequestTransformation(mapping, requestJson)
                .chain(transformedRequest -> {
                    LOG.infof("✅ Request transformed successfully");
                    
                    // Step 2: Call external API
                    return callExternalApi(mapping, transformedRequest)
                        .chain(apiResponse -> {
                            LOG.infof("✅ External API called successfully");
                            
                            // Step 3: Apply response transformation
                            return applyResponseTransformation(mapping, apiResponse)
                                .map(transformedResponse -> {
                                    LOG.infof("✅ Response transformed successfully");
                                    return new ExecutionResult(
                                        true,
                                        transformedResponse,
                                        null,
                                        requestJson,
                                        transformedRequest,
                                        apiResponse
                                    );
                                });
                        });
                })
                .onFailure().recoverWithItem(throwable -> {
                    LOG.errorf(throwable, "❌ Mapping execution failed");
                    return new ExecutionResult(
                        false,
                        null,
                        throwable.getMessage(),
                        null,
                        null,
                        null
                    );
                });

        } catch (Exception e) {
            LOG.errorf(e, "❌ Failed to parse request payload");
            return Uni.createFrom().item(
                new ExecutionResult(false, null, "Invalid JSON payload: " + e.getMessage(), null, null, null)
            );
        }
    }

    /**
     * Apply request transformation using JSONata
     */
    private Uni<JsonNode> applyRequestTransformation(MappingDraft mapping, JsonNode originalRequest) {
        // Parse source config JSON
        JsonNode sourceConfig;
        try {
            String sourceConfigStr = mapping.getSourceConfig();
            if (sourceConfigStr == null || sourceConfigStr.isBlank()) {
                return Uni.createFrom().item(originalRequest);
            }
            sourceConfig = objectMapper.readTree(sourceConfigStr);
        } catch (Exception e) {
            LOG.error("Failed to parse source config", e);
            return Uni.createFrom().item(originalRequest);
        }

        // If no request transformation rules, return original
        if (!sourceConfig.has("requestTransformation")) {
            LOG.info("No request transformation configured, using original request");
            return Uni.createFrom().item(originalRequest);
        }

        var requestTransform = sourceConfig.get("requestTransformation");
        String jsonataExpression = null;

        if (requestTransform.has("jsonata")) {
            jsonataExpression = requestTransform.get("jsonata").asText();
        } else if (requestTransform.has("template")) {
            // Convert template to JSONata
            jsonataExpression = convertTemplateToJsonata(requestTransform.get("template"));
        }

        if (jsonataExpression == null || jsonataExpression.isBlank()) {
            return Uni.createFrom().item(originalRequest);
        }

        // Call transformer service to evaluate JSONata
        return evaluateJsonata(jsonataExpression, originalRequest);
    }

    /**
     * Apply response transformation using mapping rules
     */
    private Uni<JsonNode> applyResponseTransformation(MappingDraft mapping, JsonNode apiResponse) {
        // Parse mapping rules JSON
        String mappingRulesStr = mapping.getMappingRules();
        if (mappingRulesStr == null || mappingRulesStr.isBlank()) {
            LOG.info("No response transformation rules, returning API response as-is");
            return Uni.createFrom().item(apiResponse);
        }

        try {
            JsonNode rulesNode = objectMapper.readTree(mappingRulesStr);
            if (!rulesNode.isArray() || rulesNode.size() == 0) {
                return Uni.createFrom().item(apiResponse);
            }

            // Build combined JSONata expression from transformation rules
            String jsonataExpression = buildJsonataFromRules(rulesNode);
            
            // Call transformer service to evaluate JSONata
            return evaluateJsonata(jsonataExpression, apiResponse);
        } catch (Exception e) {
            LOG.error("Failed to parse mapping rules", e);
            return Uni.createFrom().item(apiResponse);
        }
    }

    /**
     * Call external API
     */
    private Uni<JsonNode> callExternalApi(MappingDraft mapping, JsonNode requestPayload) {
        // Parse source config JSON
        JsonNode sourceConfig;
        try {
            String sourceConfigStr = mapping.getSourceConfig();
            if (sourceConfigStr == null || sourceConfigStr.isBlank()) {
                return Uni.createFrom().failure(
                    new IllegalStateException("Source config not found")
                );
            }
            sourceConfig = objectMapper.readTree(sourceConfigStr);
        } catch (Exception e) {
            return Uni.createFrom().failure(
                new IllegalStateException("Failed to parse source config: " + e.getMessage())
            );
        }
        
        if (!sourceConfig.has("url")) {
            return Uni.createFrom().failure(
                new IllegalStateException("External API URL not configured")
            );
        }

        String url = sourceConfig.get("url").asText();
        String method = sourceConfig.has("method") 
            ? sourceConfig.get("method").asText().toUpperCase() 
            : "POST";

        LOG.infof("📡 Calling external API: %s %s", method, url);

        // Build request based on method
        var request = "GET".equals(method) 
            ? webClient.getAbs(url)
            : webClient.postAbs(url);
            
        request.timeout(Duration.ofSeconds(30).toMillis())
            .putHeader("Content-Type", "application/json");

        // Add custom headers if configured
        if (sourceConfig.has("headers")) {
            var headersNode = sourceConfig.get("headers");
            headersNode.fields().forEachRemaining(entry -> {
                request.putHeader(entry.getKey(), entry.getValue().asText());
            });
        }

        // Send request based on method
        var responseFuture = "GET".equals(method)
            ? request.send()
            : request.sendJson(requestPayload.toString());
            
        return responseFuture
            .map(HttpResponse::bodyAsJsonObject)
            .map(jsonObject -> {
                try {
                    return objectMapper.readTree(jsonObject.encode());
                } catch (Exception e) {
                    throw new RuntimeException("Failed to parse API response", e);
                }
            });
    }

    /**
     * Evaluate JSONata expression using transformer service
     */
    private Uni<JsonNode> evaluateJsonata(String expression, JsonNode payload) {
        var requestBody = new JsonObject()
            .put("expression", expression)
            .put("payload", new JsonObject(payload.toString()))
            .put("timeoutMs", 5000);

        return webClient.postAbs(transformerUrl + "/v1/jsonata/evaluate")
            .timeout(Duration.ofSeconds(10).toMillis())
            .putHeader("Content-Type", "application/json")
            .sendJson(requestBody)
            .map(HttpResponse::bodyAsJsonObject)
            .map(response -> {
                if (!response.getBoolean("ok", false)) {
                    throw new RuntimeException(
                        "JSONata evaluation failed: " + response.getString("message", "Unknown error")
                    );
                }
                
                try {
                    var resultJson = response.getValue("result");
                    return objectMapper.readTree(resultJson.toString());
                } catch (Exception e) {
                    throw new RuntimeException("Failed to parse JSONata result", e);
                }
            });
    }

    /**
     * Convert template object to JSONata expression
     */
    private String convertTemplateToJsonata(JsonNode template) {
        // Simple template conversion - can be enhanced
        return template.toString();
    }

    /**
     * Build JSONata expression from transformation rules
     */
    private String buildJsonataFromRules(JsonNode rulesNode) {
        // Build a JSONata object constructor from rules
        var mappings = new HashMap<String, String>();
        
        for (JsonNode rule : rulesNode) {
            String targetKey = rule.has("targetKey") ? rule.get("targetKey").asText() : null;
            String sourcePath = rule.has("sourcePath") ? rule.get("sourcePath").asText() : null;
            
            if (targetKey != null && sourcePath != null) {
                // Simple direct mapping for now
                mappings.put(targetKey, sourcePath);
            }
        }

        // Build JSONata object
        var jsonataBuilder = new StringBuilder("{\n");
        mappings.forEach((key, value) -> {
            jsonataBuilder.append("  \"").append(key).append("\": ").append(value).append(",\n");
        });
        
        // Remove trailing comma
        if (jsonataBuilder.length() > 2) {
            jsonataBuilder.setLength(jsonataBuilder.length() - 2);
            jsonataBuilder.append("\n");
        }
        
        jsonataBuilder.append("}");
        
        return jsonataBuilder.toString();
    }

    /**
     * Result of mapping execution
     */
    public record ExecutionResult(
        boolean success,
        JsonNode transformedResponse,
        String error,
        JsonNode originalRequest,
        JsonNode transformedRequest,
        JsonNode apiResponse
    ) {}
}
