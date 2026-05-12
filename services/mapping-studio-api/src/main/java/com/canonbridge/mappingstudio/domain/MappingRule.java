package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;
import java.time.Instant;
import java.util.UUID;

/**
 * Mapping rule for field transformation
 */
public record MappingRule(
        @JsonProperty("rule_id") UUID ruleId,
        @JsonProperty("tenant_id") String tenantId,
        @JsonProperty("draft_id") UUID draftId,
        @JsonProperty("source_path") String sourcePath,
        @JsonProperty("target_key") String targetKey,
        @JsonProperty("transform") TransformType transform,
        @JsonProperty("params") JsonObject params,
        @JsonProperty("advanced_expression") String advancedExpression,
        @JsonProperty("jsonata_expression") String jsonataExpression,
        @JsonProperty("enabled") Boolean enabled,
        @JsonProperty("order_index") Integer orderIndex,
        @JsonProperty("notes") String notes,
        @JsonProperty("created_at") Instant createdAt,
        @JsonProperty("updated_at") Instant updatedAt
) {
    public enum TransformType {
        DIRECT,
        DATE_FORMAT,
        ENUM_MAP,
        NUMBER_COERCE,
        DEFAULT_VALUE,
        COMBINE,
        STRING_UPPERCASE,
        STRING_LOWERCASE,
        STRING_TRIM,
        STRING_SUBSTRING,
        STRING_REPLACE,
        ARRAY_JOIN,
        ARRAY_FIRST,
        ARRAY_LAST,
        ARRAY_ELEMENT,
        ARRAY_COUNT,
        ARRAY_FILTER_EQUALS,
        MATH_SUM,
        MATH_AVERAGE,
        MATH_MIN,
        MATH_MAX,
        CONDITIONAL_VALUE,
        TEMPLATE_STRING
    }
}
