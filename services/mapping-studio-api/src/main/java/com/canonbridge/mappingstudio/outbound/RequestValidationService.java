package com.canonbridge.mappingstudio.outbound;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.PatternSyntaxException;
import java.util.regex.Pattern;

@ApplicationScoped
public class RequestValidationService {

    public record FieldError(String field, String type, String message) {}

    public record ValidationResult(boolean valid, List<FieldError> errors) {}

    public ValidationResult validate(JsonObject payload, JsonArray rules) {
        List<FieldError> errors = new ArrayList<>();

        if (rules == null || payload == null) {
            return new ValidationResult(true, errors);
        }

        for (int i = 0; i < rules.size(); i++) {
            JsonObject rule = rules.getJsonObject(i);
            if (rule == null) continue;

            String field = rule.getString("field");
            if (field == null || field.isBlank()) continue;

            boolean required = Boolean.TRUE.equals(rule.getBoolean("required"));
            String expectedType = rule.getString("type", "any");

            Object value = getNestedValue(payload, field);

            if (value == null || isBlankValue(value)) {
                if (required) {
                    errors.add(new FieldError(field, "REQUIRED",
                        String.format("Field '%s' is required but is missing or empty", field)));
                }
                continue;
            }

            String typeError = checkType(field, value, expectedType);
            if (typeError != null) {
                errors.add(new FieldError(field, "TYPE_MISMATCH", typeError));
                continue;
            }

            if ("number".equals(expectedType) && value instanceof Number numVal) {
                double dVal = numVal.doubleValue();
                Double minValue = rule.getDouble("minValue");
                Double maxValue = rule.getDouble("maxValue");

                if (minValue != null && dVal < minValue) {
                    errors.add(new FieldError(field, "RANGE",
                        String.format("Field '%s' value %.2f is below the minimum allowed value of %.2f", 
                            field, dVal, minValue)));
                }
                if (maxValue != null && dVal > maxValue) {
                    errors.add(new FieldError(field, "RANGE",
                        String.format("Field '%s' value %.2f exceeds the maximum allowed value of %.2f", 
                            field, dVal, maxValue)));
                }
            }

            if ("string".equals(expectedType) && value instanceof String strVal) {
                Integer minLength = rule.getInteger("minLength");
                Integer maxLength = rule.getInteger("maxLength");
                String pattern = rule.getString("pattern");
                JsonArray enumValues = rule.getJsonArray("enumValues");

                if (minLength != null && strVal.length() < minLength) {
                    errors.add(new FieldError(field, "LENGTH",
                        String.format("Field '%s' length (%d characters) is below the minimum required length of %d characters", 
                            field, strVal.length(), minLength)));
                }
                if (maxLength != null && strVal.length() > maxLength) {
                    errors.add(new FieldError(field, "LENGTH",
                        String.format("Field '%s' length (%d characters) exceeds the maximum allowed length of %d characters", 
                            field, strVal.length(), maxLength)));
                }
                if (pattern != null && !pattern.isBlank()) {
                    try {
                        if (!Pattern.matches(pattern, strVal)) {
                            errors.add(new FieldError(field, "PATTERN",
                                String.format("Field '%s' value '%s' does not match the required pattern: %s", 
                                    field, strVal, pattern)));
                        }
                    } catch (PatternSyntaxException e) {
                        errors.add(new FieldError(field, "PATTERN",
                            String.format("Field '%s' has an invalid regex pattern: %s", field, e.getMessage())));
                    }
                }
                if (enumValues != null && !enumValues.isEmpty()) {
                    boolean found = false;
                    for (int j = 0; j < enumValues.size(); j++) {
                        if (strVal.equals(enumValues.getString(j))) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        String allowedValues = String.join(", ", 
                            enumValues.stream().map(Object::toString).toList());
                        errors.add(new FieldError(field, "ENUM",
                            String.format("Field '%s' value '%s' is not valid. Allowed values are: %s", 
                                field, strVal, allowedValues)));
                    }
                }
            }
        }

        return new ValidationResult(errors.isEmpty(), errors);
    }

    private Object getNestedValue(JsonObject obj, String path) {
        String[] parts = path.split("\\.");
        Object current = obj;
        for (String part : parts) {
            if (current instanceof JsonObject jo) {
                current = jo.getValue(part);
            } else {
                return null;
            }
        }
        return current;
    }

    private boolean isBlankValue(Object value) {
        if (value instanceof String s) return s.isBlank();
        return false;
    }

    private String checkType(String field, Object value, String expectedType) {
        String actualType = getTypeName(value);
        return switch (expectedType) {
            case "number" -> (value instanceof Number) ? null
                : String.format("Field '%s' must be a number, but received %s", field, actualType);
            case "string" -> (value instanceof String) ? null
                : String.format("Field '%s' must be a string, but received %s", field, actualType);
            case "boolean" -> (value instanceof Boolean) ? null
                : String.format("Field '%s' must be a boolean, but received %s", field, actualType);
            case "array" -> (value instanceof io.vertx.core.json.JsonArray) ? null
                : String.format("Field '%s' must be an array, but received %s", field, actualType);
            case "object" -> (value instanceof JsonObject) ? null
                : String.format("Field '%s' must be an object, but received %s", field, actualType);
            default -> null;
        };
    }

    private String getTypeName(Object value) {
        if (value == null) return "null";
        if (value instanceof String) return "string";
        if (value instanceof Number) return "number";
        if (value instanceof Boolean) return "boolean";
        if (value instanceof io.vertx.core.json.JsonArray) return "array";
        if (value instanceof JsonObject) return "object";
        return value.getClass().getSimpleName().toLowerCase();
    }
}
