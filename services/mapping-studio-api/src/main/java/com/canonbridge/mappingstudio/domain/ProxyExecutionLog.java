package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public class ProxyExecutionLog {

    public enum ExecutionStatus {
        PENDING, SUCCESS, ERROR, TIMEOUT
    }

    public enum ErrorStage {
        REQUEST_TRANSFORM, API_CALL, RESPONSE_TRANSFORM, VALIDATION
    }

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("tenant_id")
    private String tenantId;

    @JsonProperty("mapping_id")
    private UUID mappingId;

    @JsonProperty("correlation_id")
    private String correlationId;

    @JsonProperty("request_at")
    private Instant requestAt;

    @JsonProperty("response_at")
    private Instant responseAt;

    @JsonProperty("duration_ms")
    private Integer durationMs;

    @JsonProperty("status")
    private ExecutionStatus status;

    @JsonProperty("http_status_code")
    private Integer httpStatusCode;

    @JsonProperty("error_stage")
    private String errorStage;

    @JsonProperty("error_message")
    private String errorMessage;

    @JsonProperty("external_api_url")
    private String externalApiUrl;

    @JsonProperty("external_api_method")
    private String externalApiMethod;

    @JsonProperty("request_size_bytes")
    private Integer requestSizeBytes;

    @JsonProperty("response_size_bytes")
    private Integer responseSizeBytes;

    @JsonProperty("request_payload")
    private String requestPayload;

    @JsonProperty("response_payload")
    private String responsePayload;

    @JsonProperty("transformed_payload")
    private String transformedPayload;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public UUID getMappingId() { return mappingId; }
    public void setMappingId(UUID mappingId) { this.mappingId = mappingId; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public Instant getRequestAt() { return requestAt; }
    public void setRequestAt(Instant requestAt) { this.requestAt = requestAt; }

    public Instant getResponseAt() { return responseAt; }
    public void setResponseAt(Instant responseAt) { this.responseAt = responseAt; }

    public Integer getDurationMs() { return durationMs; }
    public void setDurationMs(Integer durationMs) { this.durationMs = durationMs; }

    public ExecutionStatus getStatus() { return status; }
    public void setStatus(ExecutionStatus status) { this.status = status; }

    public Integer getHttpStatusCode() { return httpStatusCode; }
    public void setHttpStatusCode(Integer httpStatusCode) { this.httpStatusCode = httpStatusCode; }

    public String getErrorStage() { return errorStage; }
    public void setErrorStage(String errorStage) { this.errorStage = errorStage; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getExternalApiUrl() { return externalApiUrl; }
    public void setExternalApiUrl(String externalApiUrl) { this.externalApiUrl = externalApiUrl; }

    public String getExternalApiMethod() { return externalApiMethod; }
    public void setExternalApiMethod(String externalApiMethod) { this.externalApiMethod = externalApiMethod; }

    public Integer getRequestSizeBytes() { return requestSizeBytes; }
    public void setRequestSizeBytes(Integer requestSizeBytes) { this.requestSizeBytes = requestSizeBytes; }

    public Integer getResponseSizeBytes() { return responseSizeBytes; }
    public void setResponseSizeBytes(Integer responseSizeBytes) { this.responseSizeBytes = responseSizeBytes; }

    public String getRequestPayload() { return requestPayload; }
    public void setRequestPayload(String requestPayload) { this.requestPayload = requestPayload; }

    public String getResponsePayload() { return responsePayload; }
    public void setResponsePayload(String responsePayload) { this.responsePayload = responsePayload; }

    public String getTransformedPayload() { return transformedPayload; }
    public void setTransformedPayload(String transformedPayload) { this.transformedPayload = transformedPayload; }
}
