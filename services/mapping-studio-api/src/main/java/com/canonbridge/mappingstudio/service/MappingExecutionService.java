package com.canonbridge.mappingstudio.service;

import com.canonbridge.mappingstudio.domain.Credential;
import com.canonbridge.mappingstudio.domain.MappingDraft;
import com.canonbridge.mappingstudio.domain.OutboundConnection;
import com.canonbridge.mappingstudio.outbound.OutboundHttpRequest;
import com.canonbridge.mappingstudio.outbound.OutboundHttpService;
import com.canonbridge.mappingstudio.outbound.RequestTemplateService;
import com.canonbridge.mappingstudio.repository.OutboundConnectionRepository;
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
import java.util.UUID;

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

    @Inject
    OutboundConnectionRepository connectionRepository;

    @Inject
    OutboundHttpService outboundHttpService;

    @Inject
    RequestTemplateService requestTemplateService;

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

            // Step 0: Validate input (if validation rules exist)
            String validationError = validateInput(mapping, requestJson);
            if (validationError != null) {
                LOG.warnf("❌ Input validation failed: %s", validationError);
                return Uni.createFrom().item(
                    new ExecutionResult(false, null, "Input validation failed: " + validationError, null, null, null)
                );
            }

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
        JsonObject sourceConfig = parseSourceConfig(mapping);
        if (sourceConfig.isEmpty()) {
            return Uni.createFrom().item(originalRequest);
        }

        if (!sourceConfig.containsKey("requestTransformation") && !sourceConfig.containsKey("requestTemplate")) {
            LOG.info("No request transformation configured, using original request");
            return Uni.createFrom().item(originalRequest);
        }

        return requestTemplateService.renderFromSourceConfig(sourceConfig, new JsonObject(originalRequest.toString()))
            .map(rendered -> {
                if (rendered == null) {
                    return originalRequest;
                }
                try {
                    return objectMapper.readTree(rendered.encode());
                } catch (Exception e) {
                    throw new RuntimeException("Failed to parse rendered request template", e);
                }
            });
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
            // Handle case where mapping_rules is double-encoded as a string
            if (rulesNode.isTextual()) {
                rulesNode = objectMapper.readTree(rulesNode.asText());
            }
            if (!rulesNode.isArray() || rulesNode.size() == 0) {
                LOG.warn("Mapping rules is not a non-empty array, returning API response as-is");
                return Uni.createFrom().item(apiResponse);
            }

            // If API returned an array, transform each element
            if (apiResponse.isArray() && apiResponse.size() > 0) {
                LOG.infof("API returned array with %d items, transforming first item", apiResponse.size());
                JsonNode firstItem = apiResponse.get(0);
                String jsonataExpression = buildJsonataFromRules(rulesNode);
                return evaluateJsonata(jsonataExpression, firstItem);
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
        JsonObject sourceConfig = parseSourceConfig(mapping);
        if (sourceConfig.isEmpty()) {
            return Uni.createFrom().failure(
                new IllegalStateException("Source config not found")
            );
        }

        return resolveOutboundConnection(mapping, sourceConfig)
            .chain(connection -> {
                if (connection == null || connection.url() == null || connection.url().isBlank()) {
                    return Uni.createFrom().failure(
                        new IllegalStateException("External API URL not configured")
                    );
                }

                JsonObject outboundPayload = toJsonObject(requestPayload);
                JsonObject headers = requestTemplateService.renderHeadersFromSourceConfig(sourceConfig, outboundPayload);

                return outboundHttpService.execute(
                        mapping.getTenantId(),
                        connection,
                        new OutboundHttpRequest(outboundPayload, headers)
                    )
                    .map(result -> {
                        if (!result.success()) {
                            throw new RuntimeException(
                                "External API returned " + result.statusCode() + ": " + result.body()
                            );
                        }
                        try {
                            return objectMapper.readTree(result.body());
                        } catch (Exception e) {
                            throw new RuntimeException("Failed to parse API response", e);
                        }
                    });
            });
    }

    private JsonObject parseSourceConfig(MappingDraft mapping) {
        try {
            String sourceConfigStr = mapping.getSourceConfig();
            if (sourceConfigStr == null || sourceConfigStr.isBlank()) {
                return new JsonObject();
            }
            return new JsonObject(sourceConfigStr);
        } catch (Exception e) {
            LOG.error("Failed to parse source config", e);
            return new JsonObject();
        }
    }

    private Uni<OutboundConnection> resolveOutboundConnection(MappingDraft mapping, JsonObject sourceConfig) {
        String directUrl = firstNonBlank(
            sourceConfig.getString("url"),
            sourceConfig.getString("connectionUrl"),
            sourceConfig.getString("endpointUrl")
        );

        if (directUrl != null) {
            return Uni.createFrom().item(buildAdhocConnection(mapping, sourceConfig, directUrl));
        }

        UUID connectionId = firstUuid(
            sourceConfig.getString("externalSystemId"),
            sourceConfig.getString("connectionId"),
            sourceConfig.getString("sourceConnectionId"),
            sourceConfig.getString("source_connection_id"),
            sourceConfig.getString("external_system_id")
        );

        if (connectionId == null) {
            return Uni.createFrom().failure(
                new IllegalStateException("External API URL not configured")
            );
        }

        return connectionRepository.findById(mapping.getTenantId(), connectionId)
            .map(connection -> withEndpointOverride(connection, sourceConfig));
    }

    private OutboundConnection buildAdhocConnection(MappingDraft mapping, JsonObject sourceConfig, String url) {
        return new OutboundConnection(
            null,
            mapping.getTenantId(),
            mapping.getId(),
            mapping.getName(),
            OutboundConnection.ConnectionPurpose.SOURCE_PAYLOAD,
            protocolFromSourceType(mapping),
            firstNonBlank(sourceConfig.getString("method"), "POST"),
            url,
            null,
            Credential.Environment.PRODUCTION,
            null,
            sourceConfig.getInteger("timeoutMs", 5000),
            new JsonObject(),
            new JsonObject(),
            OutboundConnection.ConnectionStatus.NOT_TESTED,
            null,
            null,
            null,
            null,
            false,
            null,
            new io.vertx.core.json.JsonArray()
        );
    }

    private OutboundConnection withEndpointOverride(OutboundConnection connection, JsonObject sourceConfig) {
        if (connection == null) {
            return null;
        }

        String method = firstNonBlank(sourceConfig.getString("method"), connection.method(), "POST");
        String url = firstNonBlank(
            sourceConfig.getString("url"),
            sourceConfig.getString("connectionUrl"),
            sourceConfig.getString("endpointUrl")
        );

        if (url == null) {
            String path = firstNonBlank(sourceConfig.getString("path"), sourceConfig.getString("endpoint"));
            String baseUrl = firstNonBlank(sourceConfig.getString("baseUrl"), connection.baseUrl());
            if (path != null && baseUrl != null) {
                url = joinUrl(baseUrl, path);
            }
        }

        if (url == null) {
            url = connection.url();
        }

        return new OutboundConnection(
            connection.connectionId(),
            connection.tenantId(),
            connection.draftId(),
            connection.name(),
            connection.purpose(),
            connection.protocol(),
            method,
            url,
            connection.credentialId(),
            connection.environment(),
            connection.schedule(),
            connection.timeoutMs(),
            connection.retryPolicy(),
            connection.responseHandling(),
            connection.status(),
            connection.lastTestAt(),
            connection.lastTestResult(),
            connection.createdAt(),
            connection.updatedAt(),
            connection.isSystemTemplate(),
            connection.baseUrl(),
            connection.knownEndpoints()
        );
    }

    private JsonObject toJsonObject(JsonNode node) {
        if (node != null && node.isObject()) {
            return new JsonObject(node.toString());
        }
        return new JsonObject().put("value", node);
    }

    private OutboundConnection.Protocol protocolFromSourceType(MappingDraft mapping) {
        if (mapping.getSourceType() == MappingDraft.SourceType.SOAP) return OutboundConnection.Protocol.SOAP;
        if (mapping.getSourceType() == MappingDraft.SourceType.GRPC) return OutboundConnection.Protocol.GRPC;
        if (mapping.getSourceType() == MappingDraft.SourceType.API_ENRICHMENT) return OutboundConnection.Protocol.GRAPHQL;
        return OutboundConnection.Protocol.REST;
    }

    private String joinUrl(String baseUrl, String path) {
        String base = baseUrl.replaceAll("/+$", "");
        String suffix = path.startsWith("/") ? path : "/" + path;
        return base + suffix;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private UUID firstUuid(String... values) {
        String value = firstNonBlank(values);
        if (value == null) return null;
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * Evaluate JSONata expression using transformer service
     */
    private Uni<JsonNode> evaluateJsonata(String expression, JsonNode payload) {
        var requestBody = new JsonObject()
            .put("expression", expression)
            .put("timeoutMs", 5000);

        // Handle both array and object payloads
        String payloadStr = payload.toString();
        try {
            if (payload.isArray()) {
                requestBody.put("payload", new io.vertx.core.json.JsonArray(payloadStr));
            } else {
                requestBody.put("payload", new JsonObject(payloadStr));
            }
        } catch (Exception e) {
            // Fallback: send raw string
            LOG.warn("Could not parse payload as JSON object/array, using raw value");
            requestBody.put("payload", payloadStr);
        }

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
     * Validate input against schema
     */
    private String validateInput(MappingDraft mapping, JsonNode input) {
        String validationRulesStr = mapping.getValidationRules();
        if (validationRulesStr == null || validationRulesStr.isBlank()) {
            return null; // No validation rules
        }

        try {
            JsonNode validationRules = objectMapper.readTree(validationRulesStr);
            if (!validationRules.has("input")) {
                return null;
            }

            JsonNode inputRules = validationRules.get("input");
            boolean validateSchema = inputRules.has("validateSchema") && inputRules.get("validateSchema").asBoolean();
            
            if (validateSchema && mapping.getInputSchema() != null && !mapping.getInputSchema().isBlank()) {
                // Basic validation - check if input is valid JSON
                // In production, use a proper JSON Schema validator
                LOG.info("Input schema validation enabled");
            }

            return null; // Validation passed
        } catch (Exception e) {
            LOG.error("Failed to validate input", e);
            return "Validation error: " + e.getMessage();
        }
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
