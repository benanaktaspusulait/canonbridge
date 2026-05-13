package com.canonbridge.mappingstudio.outbound;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ApplicationScoped
public class RequestTemplateService {

    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{\\s*([a-zA-Z0-9_.$\\[\\]-]+)\\s*}}");
    private static final Pattern EXACT_PLACEHOLDER = Pattern.compile("^\\s*\\{\\{\\s*([a-zA-Z0-9_.$\\[\\]-]+)\\s*}}\\s*$");

    public JsonObject renderFromSourceConfig(JsonObject sourceConfig, JsonObject context) {
        JsonObject request = requestConfig(sourceConfig);
        if (request == null) {
            return null;
        }

        String mode = request.getString("mode", "template");
        if (!"template".equals(mode)) {
            throw new BadRequestException("Backend request rendering currently supports template mode");
        }

        Object template = request.getValue("template");
        if (template == null) {
            return null;
        }

        Object rendered = renderValue(template, safeContext(context));
        if (rendered instanceof JsonObject json) {
            return json;
        }
        if (rendered instanceof Map<?, ?> map) {
            return mapToJsonObject(map);
        }
        throw new BadRequestException("Request template must render to a JSON object");
    }

    public JsonObject renderHeadersFromSourceConfig(JsonObject sourceConfig, JsonObject context) {
        JsonObject request = requestConfig(sourceConfig);
        if (request == null) {
            return new JsonObject();
        }
        Object headers = request.getValue("headers");
        if (headers == null) {
            return new JsonObject();
        }
        Object rendered = renderValue(headers, safeContext(context));
        if (rendered instanceof JsonObject json) {
            return json;
        }
        if (rendered instanceof Map<?, ?> map) {
            return mapToJsonObject(map);
        }
        throw new BadRequestException("Request headers template must render to a JSON object");
    }

    public JsonObject render(JsonObject template, JsonObject context) {
        Object rendered = renderValue(template, safeContext(context));
        if (rendered instanceof JsonObject json) {
            return json;
        }
        throw new BadRequestException("Request template must render to a JSON object");
    }

    private JsonObject requestConfig(JsonObject sourceConfig) {
        if (sourceConfig == null) return null;
        JsonObject nested = sourceConfig.getJsonObject("requestTransformation");
        if (nested != null) return nested;

        Object legacy = sourceConfig.getValue("requestTemplate");
        if (legacy != null) {
            return new JsonObject().put("mode", "template").put("template", legacy);
        }
        return null;
    }

    private JsonObject mapToJsonObject(Map<?, ?> map) {
        JsonObject out = new JsonObject();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            if (entry.getKey() != null) {
                out.put(String.valueOf(entry.getKey()), entry.getValue());
            }
        }
        return out;
    }

    private JsonObject safeContext(JsonObject context) {
        return context != null ? context : new JsonObject();
    }

    private Object renderValue(Object value, JsonObject context) {
        if (value instanceof JsonObject json) {
            JsonObject out = new JsonObject();
            for (String field : json.fieldNames()) {
                out.put(field, renderValue(json.getValue(field), context));
            }
            return out;
        }
        if (value instanceof JsonArray array) {
            JsonArray out = new JsonArray();
            for (int i = 0; i < array.size(); i++) {
                out.add(renderValue(array.getValue(i), context));
            }
            return out;
        }
        if (value instanceof String text) {
            Matcher exact = EXACT_PLACEHOLDER.matcher(text);
            if (exact.matches()) {
                return resolvePath(context, exact.group(1));
            }

            Matcher matcher = PLACEHOLDER.matcher(text);
            StringBuffer out = new StringBuffer();
            while (matcher.find()) {
                Object resolved = resolvePath(context, matcher.group(1));
                matcher.appendReplacement(out, Matcher.quoteReplacement(resolved == null ? "" : String.valueOf(resolved)));
            }
            matcher.appendTail(out);
            return out.toString();
        }
        return value;
    }

    private Object resolvePath(JsonObject context, String rawPath) {
        String path = rawPath.startsWith("$.") ? rawPath.substring(2) : rawPath;
        Object current = context;
        for (String part : path.split("\\.")) {
            if (part.isBlank()) continue;
            current = readPart(current, part);
            if (current == null) return null;
        }
        return current;
    }

    private Object readPart(Object current, String part) {
        String field = part;
        Integer index = null;
        int bracket = part.indexOf('[');
        if (bracket >= 0 && part.endsWith("]")) {
            field = part.substring(0, bracket);
            try {
                index = Integer.parseInt(part.substring(bracket + 1, part.length() - 1));
            } catch (NumberFormatException e) {
                return null;
            }
        }

        Object value = current;
        if (!field.isBlank()) {
            if (value instanceof JsonObject json) {
                value = json.getValue(field);
            } else if (value instanceof Map<?, ?> map) {
                value = map.get(field);
            } else {
                return null;
            }
        }

        if (index != null) {
            if (value instanceof JsonArray array && index >= 0 && index < array.size()) {
                return array.getValue(index);
            }
            if (value instanceof java.util.List<?> list && index >= 0 && index < list.size()) {
                return list.get(index);
            }
            return null;
        }
        return value;
    }
}
