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
                        "Field '" + field + "' is required but missing or empty"));
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
                        "Field '" + field + "' value " + dVal + " is below minimum " + minValue));
                }
                if (maxValue != null && dVal > maxValue) {
                    errors.add(new FieldError(field, "RANGE",
                        "Field '" + field + "' value " + dVal + " exceeds maximum " + maxValue));
                }
            }

            if ("string".equals(expectedType) && value instanceof String strVal) {
                Integer minLength = rule.getInteger("minLength");
                Integer maxLength = rule.getInteger("maxLength");
                String pattern = rule.getString("pattern");
                JsonArray enumValues = rule.getJsonArray("enumValues");

                if (minLength != null && strVal.length() < minLength) {
                    errors.add(new FieldError(field, "LENGTH",
                        "Field '" + field + "' length " + strVal.length() + " is below minimum length " + minLength));
                }
                if (maxLength != null && strVal.length() > maxLength) {
                    errors.add(new FieldError(field, "LENGTH",
                        "Field '" + field + "' length " + strVal.length() + " exceeds maximum length " + maxLength));
                }
                if (pattern != null && !pattern.isBlank()) {
                    try {
                        if (!Pattern.matches(pattern, strVal)) {
                            errors.add(new FieldError(field, "PATTERN",
                                "Field '" + field + "' value '" + strVal + "' does not match pattern: " + pattern));
                        }
                    } catch (PatternSyntaxException ignored) {
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
                        errors.add(new FieldError(field, "ENUM",
                            "Field '" + field + "' value '" + strVal + "' must be one of: " + enumValues.encode()));
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
        return switch (expectedType) {
            case "number" -> (value instanceof Number) ? null
                : "Field '" + field + "' expected number but got " + value.getClass().getSimpleName();
            case "string" -> (value instanceof String) ? null
                : "Field '" + field + "' expected string but got " + value.getClass().getSimpleName();
            case "boolean" -> (value instanceof Boolean) ? null
                : "Field '" + field + "' expected boolean but got " + value.getClass().getSimpleName();
            default -> null;
        };
    }
}
