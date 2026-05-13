package com.canonbridge.mappingstudio.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@ApplicationScoped
public class SourcePayloadValidator {

    @Inject
    ObjectMapper objectMapper;

    public ValidationResult validate(String inputSchema, String rawPayload) {
        try {
            if (objectMapper == null) {
                objectMapper = new ObjectMapper();
            }
            JsonNode payload = objectMapper.readTree(rawPayload);
            JsonNode schema = inputSchema == null || inputSchema.isBlank()
                    ? objectMapper.createObjectNode()
                    : objectMapper.readTree(inputSchema);
            return validate(schema, payload);
        } catch (Exception e) {
            return new ValidationResult(false, List.of("Payload or schema is not valid JSON: " + e.getMessage()));
        }
    }

    ValidationResult validate(JsonNode schema, JsonNode payload) {
        List<String> errors = new ArrayList<>();
        if (schema.has("type") && "object".equals(schema.get("type").asText()) && !payload.isObject()) {
            errors.add("Payload must be a JSON object");
        }

        JsonNode required = schema.get("required");
        if (required != null && required.isArray()) {
            for (JsonNode field : required) {
                String name = field.asText();
                if (!payload.has(name) || payload.get(name).isNull()) {
                    errors.add("Missing required field: " + name);
                }
            }
        }

        JsonNode properties = schema.get("properties");
        if (properties != null && properties.isObject() && payload.isObject()) {
            Iterator<String> names = properties.fieldNames();
            while (names.hasNext()) {
                String name = names.next();
                if (payload.has(name) && !matchesType(properties.get(name), payload.get(name))) {
                    errors.add("Field " + name + " does not match schema type " + properties.get(name).get("type").asText());
                }
            }
        }

        return new ValidationResult(errors.isEmpty(), errors);
    }

    private boolean matchesType(JsonNode propertySchema, JsonNode value) {
        JsonNode type = propertySchema.get("type");
        if (type == null || !type.isTextual()) {
            return true;
        }
        return switch (type.asText()) {
            case "string" -> value.isTextual();
            case "number" -> value.isNumber();
            case "integer" -> value.isIntegralNumber();
            case "boolean" -> value.isBoolean();
            case "object" -> value.isObject();
            case "array" -> value.isArray();
            case "null" -> value.isNull();
            default -> true;
        };
    }

    public record ValidationResult(boolean valid, List<String> errors) {}
}
