package com.canonbridge.mappingstudio.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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
            return new ValidationResult(false, List.of("The payload or schema contains invalid JSON. Verify that both are well-formed JSON documents."));
        }
    }

    ValidationResult validate(JsonNode schema, JsonNode payload) {
        List<String> errors = new ArrayList<>();
        validateNode(schema, payload, "$", errors);
        return new ValidationResult(errors.isEmpty(), errors);
    }

    private void validateNode(JsonNode schema, JsonNode payload, String path, List<String> errors) {
        if (schema == null || schema.isMissingNode() || schema.isNull()) {
            return;
        }

        if (!matchesType(schema, payload)) {
            errors.add(String.format("%s must be %s", path, describeType(schema.get("type"))));
            return;
        }

        JsonNode required = schema.get("required");
        if (required != null && required.isArray() && payload.isObject()) {
            for (JsonNode field : required) {
                String name = field.asText();
                if (!payload.has(name) || payload.get(name).isNull()) {
                    errors.add("Missing required field: " + pathFor(path, name));
                }
            }
        }

        JsonNode properties = schema.get("properties");
        if (properties != null && properties.isObject() && payload.isObject()) {
            Iterator<String> names = properties.fieldNames();
            while (names.hasNext()) {
                String name = names.next();
                JsonNode propSchema = properties.get(name);
                if (payload.has(name) && propSchema != null) {
                    validateNode(propSchema, payload.get(name), pathFor(path, name), errors);
                }
            }
        }

        JsonNode items = schema.get("items");
        if (items != null && payload.isArray()) {
            for (int i = 0; i < payload.size(); i++) {
                validateNode(items, payload.get(i), path + "[" + i + "]", errors);
            }
        }

        JsonNode enumValues = schema.get("enum");
        if (enumValues != null && enumValues.isArray()) {
            boolean matched = false;
            for (JsonNode enumValue : enumValues) {
                if (enumValue.equals(payload)) {
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                String allowed = StreamSupport.stream(enumValues.spliterator(), false)
                        .map(JsonNode::toString)
                        .collect(Collectors.joining(", "));
                errors.add(String.format("%s must be one of [%s]", path, allowed));
            }
        }

        JsonNode additionalProperties = schema.get("additionalProperties");
        if (additionalProperties != null && additionalProperties.isBoolean()
                && !additionalProperties.asBoolean() && properties != null && payload.isObject()) {
            Iterator<String> payloadNames = payload.fieldNames();
            while (payloadNames.hasNext()) {
                String name = payloadNames.next();
                if (!properties.has(name)) {
                    errors.add("Unexpected field: " + pathFor(path, name));
                }
            }
        }
    }

    private boolean matchesType(JsonNode propertySchema, JsonNode value) {
        JsonNode type = propertySchema.get("type");
        if (type == null) {
            return true;
        }

        if (type.isArray()) {
            for (JsonNode option : type) {
                if (option.isTextual() && matchesType(option.asText(), value)) {
                    return true;
                }
            }
            return false;
        }

        if (!type.isTextual()) {
            return true;
        }
        return matchesType(type.asText(), value);
    }

    private boolean matchesType(String type, JsonNode value) {
        return switch (type) {
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

    private String describeType(JsonNode type) {
        if (type == null) return "the expected schema type";
        if (type.isArray()) {
            return StreamSupport.stream(type.spliterator(), false)
                    .map(JsonNode::asText)
                    .collect(Collectors.joining(" or "));
        }
        return type.asText("the expected schema type");
    }

    private String pathFor(String parent, String child) {
        return "$".equals(parent) ? "$." + child : parent + "." + child;
    }

    public record ValidationResult(boolean valid, List<String> errors) {}
}
