package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

/**
 * Dead Letter Queue Message
 */
public class DlqMessage {

    @JsonProperty("id")
    private String id;

    @JsonProperty("originalTopic")
    private String originalTopic;

    @JsonProperty("partition")
    private Integer partition;

    @JsonProperty("offset")
    private Long offset;

    @JsonProperty("key")
    private String key;

    @JsonProperty("payload")
    private String payload;

    @JsonProperty("errorMessage")
    private String errorMessage;

    @JsonProperty("errorStackTrace")
    private String errorStackTrace;

    @JsonProperty("failedAt")
    private Instant failedAt;

    @JsonProperty("retryCount")
    private Integer retryCount;

    @JsonProperty("status")
    private DlqStatus status;

    @JsonProperty("redriveAttemptedAt")
    private Instant redriveAttemptedAt;

    public enum DlqStatus {
        FAILED,
        REDRIVING,
        REDRIVEN,
        PERMANENTLY_FAILED
    }

    // Constructors
    public DlqMessage() {
        this.retryCount = 0;
        this.status = DlqStatus.FAILED;
        this.failedAt = Instant.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOriginalTopic() {
        return originalTopic;
    }

    public void setOriginalTopic(String originalTopic) {
        this.originalTopic = originalTopic;
    }

    public Integer getPartition() {
        return partition;
    }

    public void setPartition(Integer partition) {
        this.partition = partition;
    }

    public Long getOffset() {
        return offset;
    }

    public void setOffset(Long offset) {
        this.offset = offset;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getErrorStackTrace() {
        return errorStackTrace;
    }

    public void setErrorStackTrace(String errorStackTrace) {
        this.errorStackTrace = errorStackTrace;
    }

    public Instant getFailedAt() {
        return failedAt;
    }

    public void setFailedAt(Instant failedAt) {
        this.failedAt = failedAt;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public DlqStatus getStatus() {
        return status;
    }

    public void setStatus(DlqStatus status) {
        this.status = status;
    }

    public Instant getRedriveAttemptedAt() {
        return redriveAttemptedAt;
    }

    public void setRedriveAttemptedAt(Instant redriveAttemptedAt) {
        this.redriveAttemptedAt = redriveAttemptedAt;
    }
}
