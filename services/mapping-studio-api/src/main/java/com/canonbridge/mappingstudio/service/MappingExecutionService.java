package com.canonbridge.mappingstudio.service;

import com.canonbridge.mappingstudio.domain.Credential;
import com.canonbridge.mappingstudio.domain.MappingDraft;
import com.canonbridge.mappingstudio.domain.OutboundConnection;
import com.canonbridge.mappingstudio.outbound.OutboundHttpRequest;
import com.canonbridge.mappingstudio.outbound.OutboundHttpService;
import com.canonbridge.mappingstudio.outbound.RequestTemplateService;
import com.canonbridge.mappingstudio.outbound.CircuitBreaker;
import com.canonbridge.mappingstudio.repository.OutboundConnectionRepository;
import com.canonbridge.mappingstudio.validation.SourcePayloadValidator;
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
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

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

    @Inject
    SourcePayloadValidator sourcePayloadValidator;

    @Inject
    com.canonbridge.mappingstudio.repository.ProxyExecutionLogRepository executionLogRepository;

    @Inject
    ProxyMetricsService metricsService;

    private final CircuitBreaker circuitBreaker = new CircuitBreaker(5, 30);

    @ConfigProperty(name = "canonbridge.transformer.url", defaultValue = "http://localhost:8083")
    String transformerUrl;

    /**
     * Execute a mapping end-to-end with execution logging
     */
    public Uni<ExecutionResult> executeMapping(
            MappingDraft mapping,
            String requestPayload,
            HttpHeaders headers) {

        String headerCorrelationId = headers != null ? headers.getHeaderString("X-Correlation-Id") : null;
        String correlationId = headerCorrelationId != null && !headerCorrelationId.isBlank()
            ? headerCorrelationId
            : java.util.UUID.randomUUID().toString().substring(0, 8);
        long startTime = System.currentTimeMillis();
        LOG.infof("[%s] 📥 Starting mapping execution for: %s", correlationId, mapping.getName());

        try {
            JsonNode requestJson = objectMapper.readTree(requestPayload);

            // Step 0: Validate incoming request against validation_rules
            String validationError = validateAgainstRules(mapping.getValidationRules(), requestJson, "request");
            if (validationError != null) {
                LOG.warnf("❌ Request validation failed: %s", validationError);
                return Uni.createFrom().item(
                    new ExecutionResult(false, null, "Request validation failed: " + validationError, requestJson, null, null)
                );
            }

            // Step 1: Apply request transformation
            return applyRequestTransformation(mapping, requestJson)
                .chain(transformedRequest -> {
                    LOG.infof("✅ Request transformed successfully");
                    
                    // Step 2: Call external API (pass original request for URL param substitution)
                    return callExternalApi(mapping, transformedRequest, requestJson)
                        .chain(apiResponse -> {
                            LOG.infof("✅ External API called successfully");
                            
                            // Step 3: Apply response transformation
                            return applyResponseTransformation(mapping, apiResponse)
                                .map(transformedResponse -> {
                                    LOG.infof("✅ Response transformed successfully");

                                    // Step 4: Validate transformed response against canonical schema
                                    String responseError = validateAgainstSchema(mapping, transformedResponse);
                                    if (responseError != null) {
                                        LOG.warnf("⚠️ Response validation failed: %s", responseError);
                                        return new ExecutionResult(
                                            false,
                                            transformedResponse,
                                            "Response validation failed: " + responseError,
                                            requestJson,
                                            transformedRequest,
                                            apiResponse
                                        );
                                    }

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
                    LOG.errorf(throwable, "[%s] ❌ Mapping execution failed", correlationId);
                    return new ExecutionResult(
                        false,
                        null,
                        throwable.getMessage(),
                        null,
                        null,
                        null
                    );
                })
                .invoke(result -> recordExecution(mapping, requestPayload, correlationId, startTime, result, true));

        } catch (Exception e) {
            LOG.errorf(e, "❌ Failed to parse request payload");
            var result = new ExecutionResult(false, null, "Invalid JSON payload: " + e.getMessage(), null, null, null);
            recordExecution(mapping, requestPayload, correlationId, startTime, result, false);
            return Uni.createFrom().item(result);
        }
    }

    public Uni<ExecutionResult> testSourceMapping(MappingDraft mapping, String requestPayload) {
        try {
            JsonNode requestJson = objectMapper.readTree(requestPayload);
            String validationError = validateAgainstRules(mapping.getValidationRules(), requestJson, "source mapping test");
            if (validationError != null) {
                return Uni.createFrom().item(
                    new ExecutionResult(false, null, "Request validation failed: " + validationError, requestJson, null, null)
                );
            }
            return applyResponseTransformation(mapping, requestJson)
                .map(transformed -> new ExecutionResult(true, transformed, null, requestJson, requestJson, transformed))
                .onFailure().recoverWithItem(error -> new ExecutionResult(
                    false,
                    null,
                    error.getMessage(),
                    requestJson,
                    null,
                    null
                ));
        } catch (Exception e) {
            return Uni.createFrom().item(new ExecutionResult(false, null, "Invalid JSON payload: " + e.getMessage(), null, null, null));
        }
    }

    private void recordExecution(
            MappingDraft mapping,
            String requestPayload,
            String correlationId,
            long startTime,
            ExecutionResult result,
            boolean storeRequestPayload) {
        long durationMs = System.currentTimeMillis() - startTime;
        var log = new com.canonbridge.mappingstudio.domain.ProxyExecutionLog();
        log.setTenantId(mapping.getTenantId());
        log.setMappingId(mapping.getId());
        log.setCorrelationId(correlationId);
        log.setRequestAt(java.time.Instant.ofEpochMilli(startTime));
        log.setResponseAt(java.time.Instant.now());
        log.setDurationMs((int) durationMs);
        log.setStatus(result.success()
            ? com.canonbridge.mappingstudio.domain.ProxyExecutionLog.ExecutionStatus.SUCCESS
            : com.canonbridge.mappingstudio.domain.ProxyExecutionLog.ExecutionStatus.ERROR);
        log.setErrorMessage(result.error());
        
        // Classify error stage
        if (result.error() != null) {
            String err = result.error();
            if (err.contains("Request validation")) log.setErrorStage("VALIDATION");
            else if (err.contains("External API") || err.contains("Circuit breaker")) log.setErrorStage("API_CALL");
            else if (err.contains("Response validation")) log.setErrorStage("RESPONSE_VALIDATION");
            else if (err.contains("JSONata") || err.contains("transformation")) log.setErrorStage("TRANSFORM");
            else if (err.contains("timeout") || err.contains("Timeout")) log.setErrorStage("TIMEOUT");
            else if (err.contains("401") || err.contains("403") || err.contains("Authorization")) log.setErrorStage("AUTH_ERROR");
            else log.setErrorStage("UNKNOWN");
        }
        
        log.setRequestSizeBytes(requestPayload != null ? requestPayload.length() : 0);
        log.setRequestPayload(storeRequestPayload ? requestPayload : null);

        if (result.transformedResponse() != null) {
            String transformed = result.transformedResponse().toString();
            log.setResponseSizeBytes(transformed.length());
            log.setTransformedPayload(transformed);
        }
        if (result.apiResponse() != null) {
            log.setResponsePayload(result.apiResponse().toString());
        }

        try {
            var sc = new io.vertx.core.json.JsonObject(mapping.getSourceConfig());
            log.setExternalApiUrl(sc.getString("url"));
            log.setExternalApiMethod(sc.getString("method", "GET"));
        } catch (Exception ignored) {}

        executionLogRepository.create(log).subscribe().with(
            saved -> LOG.infof("[%s] 📝 Execution logged: %s %dms", correlationId, log.getStatus(), durationMs),
            err -> LOG.warnf("[%s] ⚠️ Failed to save execution log: %s", correlationId, err.getMessage())
        );

        String mappingIdStr = mapping.getId() != null ? mapping.getId().toString().substring(0, 8) : "unknown";
        metricsService.recordProxyRequest(mappingIdStr, result.success() ? "success" : "error", durationMs);
        if (!result.success() && result.error() != null) {
            String stage = result.error().contains("Request validation") ? "VALIDATION"
                : result.error().contains("External API") ? "API_CALL"
                : result.error().contains("Response validation") ? "RESPONSE_VALIDATION"
                : result.error().contains("Invalid JSON") ? "REQUEST_PARSE"
                : "TRANSFORM";
            metricsService.recordError(mappingIdStr, stage, "proxy_failure");
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
     * Apply response transformation using mapping rules or generated JSONata
     */
    private Uni<JsonNode> applyResponseTransformation(MappingDraft mapping, JsonNode apiResponse) {
        // First check if there's a direct JSONata expression
        String generatedJsonata = mapping.getGeneratedJsonata();
        if (generatedJsonata != null && !generatedJsonata.isBlank()) {
            LOG.infof("Using generated_jsonata expression for response transformation");
            JsonNode targetPayload = apiResponse;
            if (apiResponse.isArray() && apiResponse.size() > 0) {
                targetPayload = apiResponse.get(0);
            }
            return evaluateJsonata(generatedJsonata, targetPayload);
        }

        // Then try mapping_rules
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
            
            // If mapping_rules is an object with $type=jsonata, use the expression directly
            if (rulesNode.isObject() && rulesNode.has("expression")) {
                String expression = rulesNode.get("expression").asText();
                if (expression != null && !expression.isBlank()) {
                    LOG.infof("Using JSONata expression from mapping_rules object");
                    JsonNode targetPayload = apiResponse;
                    if (apiResponse.isArray() && apiResponse.size() > 0) {
                        targetPayload = apiResponse.get(0);
                    }
                    return evaluateJsonata(expression, targetPayload);
                }
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
    private Uni<JsonNode> callExternalApi(MappingDraft mapping, JsonNode requestPayload, JsonNode originalRequest) {
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

                JsonObject outboundPayload = prepareProtocolPayload(mapping, sourceConfig, requestPayload, originalRequest);
                
                // Substitute URL path parameters using original request (before transformation)
                JsonObject urlParams = toJsonObject(originalRequest);
                String resolvedUrl = substituteUrlParams(connection.url(), urlParams);
                OutboundConnection resolvedConnection = resolvedUrl.equals(connection.url()) 
                    ? connection 
                    : connection.withUrl(resolvedUrl);

                JsonObject headers = requestTemplateService.renderHeadersFromSourceConfig(sourceConfig, outboundPayload);
                if (mapping.getSourceType() == MappingDraft.SourceType.SOAP) {
                    String soapAction = firstNonBlank(sourceConfig.getString("soapAction"), sourceConfig.getString("action"));
                    if (soapAction != null) {
                        headers.put("SOAPAction", soapAction);
                    }
                }

                // Fallback: if no Authorization header from requestTransformation, check source_config for bearerToken
                if (!headers.containsKey("Authorization") && !headers.containsKey("authorization")) {
                    String bearerToken = sourceConfig.getString("bearerToken");
                    if (bearerToken != null && !bearerToken.isBlank()) {
                        headers.put("Authorization", "Bearer " + bearerToken);
                        LOG.infof("🔑 Added Bearer token from source_config");
                    }
                }

                // Check circuit breaker before calling external API
                String circuitKey = resolvedConnection.url();
                if (!circuitBreaker.isAllowed(circuitKey)) {
                    return Uni.createFrom().failure(
                        new RuntimeException("Circuit breaker OPEN for: " + circuitKey + " (external API unavailable)")
                    );
                }

                return outboundHttpService.execute(
                        mapping.getTenantId(),
                        resolvedConnection,
                        new OutboundHttpRequest(outboundPayload, headers)
                    )
                    .map(result -> {
                        if (!result.success()) {
                            circuitBreaker.recordFailure(circuitKey);
                            throw new RuntimeException(
                                "External API returned " + result.statusCode() + ": " + result.body()
                            );
                        }
                        circuitBreaker.recordSuccess(circuitKey);
                        return parseApiResponseBody(result.body(), resolvedConnection.protocol());
                    });
            });
    }

    private JsonObject prepareProtocolPayload(
            MappingDraft mapping,
            JsonObject sourceConfig,
            JsonNode transformedRequest,
            JsonNode originalRequest) {
        JsonObject payload = toJsonObject(transformedRequest);

        if (mapping.getSourceType() == MappingDraft.SourceType.GRAPHQL) {
            String query = sourceConfig.getString("query");
            if (query == null || query.isBlank()) {
                return payload;
            }
            JsonObject variables = jsonObjectValue(sourceConfig.getValue("variables")).copy();
            variables.mergeIn(toJsonObject(originalRequest), true);
            JsonObject graphql = new JsonObject()
                .put("query", query)
                .put("variables", variables);
            String operationName = sourceConfig.getString("operationName");
            if (operationName != null && !operationName.isBlank()) {
                graphql.put("operationName", operationName);
            }
            return graphql;
        }

        if (mapping.getSourceType() == MappingDraft.SourceType.SOAP) {
            JsonObject soap = new JsonObject()
                .put("operation", firstNonBlank(sourceConfig.getString("operation"), sourceConfig.getString("soapOperation"), "TrackShipment"))
                .put("namespace", firstNonBlank(sourceConfig.getString("namespace"), "http://fastcargo.com/tracking"))
                .put("body", payload);
            String envelope = sourceConfig.getString("soapEnvelope");
            if (envelope != null && !envelope.isBlank()) {
                soap.put("soapEnvelope", renderStringTemplate(envelope, toJsonObject(originalRequest)));
            }
            return soap;
        }

        return payload;
    }

    private JsonNode parseApiResponseBody(String body, OutboundConnection.Protocol protocol) {
        try {
            if (protocol == OutboundConnection.Protocol.SOAP) {
                return objectMapper.readTree(xmlToJson(body).encode());
            }
            JsonNode parsed = objectMapper.readTree(body);
            if (protocol == OutboundConnection.Protocol.GRAPHQL && parsed.has("errors")) {
                throw new RuntimeException("GraphQL response contains errors: " + parsed.get("errors"));
            }
            if (protocol == OutboundConnection.Protocol.GRAPHQL && parsed.has("data")) {
                return parsed.get("data");
            }
            return parsed;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse API response", e);
        }
    }

    private JsonObject xmlToJson(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(false);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        Element root = factory.newDocumentBuilder()
            .parse(new org.xml.sax.InputSource(new java.io.StringReader(xml)))
            .getDocumentElement();

        Element body = firstElementByLocalName(root, "Body");
        Element payload = firstChildElement(body != null ? body : root);
        Element source = payload != null ? payload : root;
        return new JsonObject().put(localName(source), elementValue(source));
    }

    private Object elementValue(Element element) {
        JsonObject children = new JsonObject();
        NodeList nodes = element.getChildNodes();
        boolean hasElementChildren = false;
        for (int i = 0; i < nodes.getLength(); i++) {
            Node node = nodes.item(i);
            if (node instanceof Element child) {
                hasElementChildren = true;
                children.put(localName(child), elementValue(child));
            }
        }
        if (hasElementChildren) {
            return children;
        }
        return element.getTextContent() != null ? element.getTextContent().trim() : "";
    }

    private Element firstElementByLocalName(Element root, String name) {
        NodeList nodes = root.getElementsByTagName("*");
        for (int i = 0; i < nodes.getLength(); i++) {
            Node node = nodes.item(i);
            if (node instanceof Element element && name.equals(localName(element))) {
                return element;
            }
        }
        return null;
    }

    private Element firstChildElement(Element root) {
        NodeList nodes = root.getChildNodes();
        for (int i = 0; i < nodes.getLength(); i++) {
            Node node = nodes.item(i);
            if (node instanceof Element element) {
                return element;
            }
        }
        return null;
    }

    private String localName(Element element) {
        String local = element.getLocalName();
        if (local != null) return local;
        String nodeName = element.getNodeName();
        int index = nodeName.indexOf(':');
        return index >= 0 ? nodeName.substring(index + 1) : nodeName;
    }

    private String renderStringTemplate(String template, JsonObject context) {
        String rendered = template;
        for (String key : context.fieldNames()) {
            Object value = context.getValue(key);
            rendered = rendered.replace("{{" + key + "}}", value != null ? String.valueOf(value) : "");
        }
        return rendered;
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

    private JsonObject jsonObjectValue(Object value) {
        if (value instanceof JsonObject jsonObject) {
            return jsonObject;
        }
        if (value instanceof String stringValue && !stringValue.isBlank()) {
            try {
                return new JsonObject(stringValue);
            } catch (Exception ignored) {
                return new JsonObject();
            }
        }
        return new JsonObject();
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
        if (mapping.getSourceType() == MappingDraft.SourceType.GRAPHQL) return OutboundConnection.Protocol.GRAPHQL;
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

    /**
     * Substitute URL path parameters like {orderId} with values from the request payload.
     * Example: http://api.example.com/orders/{orderId} + {"orderId":"ORD-5001"}
     *       -> http://api.example.com/orders/ORD-5001
     */
    private String substituteUrlParams(String url, JsonObject payload) {
        if (url == null || !url.contains("{")) return url;
        
        String result = url;
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\{([^}]+)\\}");
        java.util.regex.Matcher matcher = pattern.matcher(url);
        
        while (matcher.find()) {
            String paramName = matcher.group(1);
            String value = payload.getString(paramName);
            if (value != null && !value.isBlank()) {
                result = result.replace("{" + paramName + "}", value);
                LOG.infof("🔗 URL param substitution: {%s} -> %s", paramName, value);
            }
        }
        
        return result;
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
     * Validate JSON against validation rules array.
     * Rules format: [{"id":"v1","path":"transactionId","kind":"required","paramA":"","paramB":"","enabled":true},...]
     * Supported kinds: required, min, max, min_length, max_length, pattern, enum, type
     */
    private String validateAgainstRules(String validationRulesStr, JsonNode payload, String context) {
        if (validationRulesStr == null || validationRulesStr.isBlank()) {
            return null;
        }

        try {
            JsonNode rules = objectMapper.readTree(validationRulesStr);
            // Handle double-encoded strings
            if (rules.isTextual()) {
                rules = objectMapper.readTree(rules.asText());
            }
            if (!rules.isArray() || rules.size() == 0) {
                return null;
            }

            java.util.List<String> errors = new java.util.ArrayList<>();

            for (JsonNode rule : rules) {
                if (!rule.path("enabled").asBoolean(true)) continue;

                String path = rule.path("path").asText();
                String kind = rule.path("kind").asText();
                String paramA = rule.path("paramA").asText("");
                if (path.isBlank() || kind.isBlank()) continue;

                JsonNode value = getByPath(payload, path);

                switch (kind) {
                    case "required" -> {
                        if (value == null || value.isMissingNode() || value.isNull() ||
                            (value.isTextual() && value.asText().isBlank())) {
                            errors.add(String.format("Field '%s' is required", path));
                        }
                    }
                    case "type" -> {
                        if (value != null && !value.isMissingNode() && !value.isNull()) {
                            String expected = paramA.toLowerCase();
                            if (!matchesType(value, expected)) {
                                errors.add(String.format("Field '%s' must be of type %s", path, expected));
                            }
                        }
                    }
                    case "min" -> {
                        if (value != null && value.isNumber()) {
                            try {
                                double minVal = Double.parseDouble(paramA);
                                if (value.asDouble() < minVal) {
                                    errors.add(String.format("Field '%s' value %s is below minimum %s", path, value.asText(), paramA));
                                }
                            } catch (NumberFormatException ignored) {}
                        }
                    }
                    case "max" -> {
                        if (value != null && value.isNumber()) {
                            try {
                                double maxVal = Double.parseDouble(paramA);
                                if (value.asDouble() > maxVal) {
                                    errors.add(String.format("Field '%s' value %s exceeds maximum %s", path, value.asText(), paramA));
                                }
                            } catch (NumberFormatException ignored) {}
                        }
                    }
                    case "min_length" -> {
                        if (value != null && value.isTextual()) {
                            try {
                                int minLen = Integer.parseInt(paramA);
                                if (value.asText().length() < minLen) {
                                    errors.add(String.format("Field '%s' length %d is below minimum %d", path, value.asText().length(), minLen));
                                }
                            } catch (NumberFormatException ignored) {}
                        }
                    }
                    case "max_length" -> {
                        if (value != null && value.isTextual()) {
                            try {
                                int maxLen = Integer.parseInt(paramA);
                                if (value.asText().length() > maxLen) {
                                    errors.add(String.format("Field '%s' length %d exceeds maximum %d", path, value.asText().length(), maxLen));
                                }
                            } catch (NumberFormatException ignored) {}
                        }
                    }
                    case "pattern" -> {
                        if (value != null && value.isTextual() && !paramA.isBlank()) {
                            try {
                                if (!java.util.regex.Pattern.matches(paramA, value.asText())) {
                                    errors.add(String.format("Field '%s' does not match pattern %s", path, paramA));
                                }
                            } catch (java.util.regex.PatternSyntaxException ignored) {}
                        }
                    }
                    case "enum" -> {
                        if (value != null && value.isTextual() && !paramA.isBlank()) {
                            String[] allowed = paramA.split(",");
                            String strVal = value.asText().trim();
                            boolean found = false;
                            for (String a : allowed) {
                                if (a.trim().equals(strVal)) { found = true; break; }
                            }
                            if (!found) {
                                errors.add(String.format("Field '%s' value '%s' must be one of: %s", path, strVal, paramA));
                            }
                        }
                    }
                }
            }

            if (errors.isEmpty()) {
                LOG.infof("✓ %s validation passed (%d rules checked)", context, rules.size());
                return null;
            }
            return String.join("; ", errors);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to validate %s against rules", context);
            return null; // Don't block on validation parser error
        }
    }

    /**
     * Validate transformed response against canonical schema (JSON Schema).
     */
    private String validateAgainstSchema(MappingDraft mapping, JsonNode response) {
        String schemaJson = mapping.getTargetSchemaJson();
        String schemaRef = mapping.getCanonicalSchemaRef();
        if ((schemaJson == null || schemaJson.isBlank()) && (schemaRef == null || schemaRef.isBlank())) {
            return null; // No schema configured
        }

        if (response == null) {
            return "Response is null";
        }

        if (schemaJson == null || schemaJson.isBlank()) {
            LOG.infof("Response schema reference configured without inline target_schema_json: %s", schemaRef);
            return null;
        }

        SourcePayloadValidator.ValidationResult result = sourcePayloadValidator.validate(schemaJson, response.toString());
        if (!result.valid()) {
            return String.join("; ", result.errors());
        }

        LOG.infof("✓ Response validated against target schema%s",
                schemaRef != null && !schemaRef.isBlank() ? " (" + schemaRef + ")" : "");
        return null;
    }

    private JsonNode getByPath(JsonNode root, String path) {
        if (root == null || path == null || path.isBlank()) return null;
        String[] parts = path.split("\\.");
        JsonNode current = root;
        for (String part : parts) {
            if (current == null || current.isMissingNode() || current.isNull()) return null;
            current = current.get(part);
        }
        return current;
    }

    private boolean matchesType(JsonNode value, String expected) {
        return switch (expected) {
            case "string" -> value.isTextual();
            case "number" -> value.isNumber();
            case "integer" -> value.isIntegralNumber();
            case "boolean" -> value.isBoolean();
            case "array" -> value.isArray();
            case "object" -> value.isObject();
            default -> true;
        };
    }

    /**
     * Validate input against schema (legacy - kept for compatibility)
     */
    private String validateInput(MappingDraft mapping, JsonNode input) {
        return validateAgainstRules(mapping.getValidationRules(), input, "input");
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
