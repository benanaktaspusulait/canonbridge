package com.canonbridge.mappingstudio.outbound;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ApplicationScoped
public class RequestTemplateService {

    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{\\s*([a-zA-Z0-9_.$\\[\\]-]+)\\s*}}");
    private static final Pattern EXACT_PLACEHOLDER = Pattern.compile("^\\s*\\{\\{\\s*([a-zA-Z0-9_.$\\[\\]-]+)\\s*}}\\s*$");
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @ConfigProperty(name = "canonbridge.transformer.url")
    String transformerUrl;

    public Uni<JsonObject> renderFromSourceConfig(JsonObject sourceConfig, JsonObject context) {
        JsonObject request = requestConfig(sourceConfig);
        if (request == null) {
            return Uni.createFrom().nullItem();
        }

        String mode = request.getString("mode", "template");
        if ("jsonata".equals(mode)) {
            return renderJsonata(request, safeContext(context));
        }
        if (!"template".equals(mode)) {
            return Uni.createFrom().failure(new BadRequestException("Unsupported request rendering mode: " + mode));
        }

        Object template = request.getValue("template");
        if (template == null) {
            return Uni.createFrom().nullItem();
        }

        Object rendered = renderValue(template, safeContext(context));
        if (rendered instanceof JsonObject json) {
            return Uni.createFrom().item(json);
        }
        if (rendered instanceof Map<?, ?> map) {
            return Uni.createFrom().item(mapToJsonObject(map));
        }
        return Uni.createFrom().failure(new BadRequestException("Request template must render to a JSON object"));
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

    public Uni<JsonObject> evaluate(String expression, JsonObject payload, int timeoutMs) {
        JsonObject request = new JsonObject()
                .put("jsonata", expression)
                .put("timeoutMs", timeoutMs);
        return renderJsonata(request, payload != null ? payload : new JsonObject());
    }

    private Uni<JsonObject> renderJsonata(JsonObject request, JsonObject context) {
        String expression = request.getString("jsonata", "").trim();
        if (expression.isEmpty()) {
            return Uni.createFrom().failure(new BadRequestException("JSONata request mapping expression is required"));
        }
        String baseUrl = transformerUrl == null ? "" : transformerUrl.trim();
        if (baseUrl.isEmpty()) {
            return Uni.createFrom().failure(new BadRequestException("Transformer URL is not configured for JSONata request rendering"));
        }

        JsonObject payload = new JsonObject()
                .put("payload", context)
                .put("expression", expression)
                .put("timeoutMs", request.getInteger("timeoutMs", 1000));
        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl.replaceAll("/+$", "") + "/v1/jsonata/evaluate"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload.encode()))
                .build();

        return Uni.createFrom()
                .completionStage(() -> httpClient.sendAsync(httpRequest, HttpResponse.BodyHandlers.ofString()))
                .map(response -> {
                    JsonObject body = parseJson(response.body());
                    if (response.statusCode() >= 400) {
                        String message = body.getString("message", "JSONata request mapping failed");
                        throw new BadRequestException(message);
                    }
                    Object result = body.getValue("result");
                    if (result instanceof JsonObject json) {
                        return json;
                    }
                    if (result instanceof Map<?, ?> map) {
                        return mapToJsonObject(map);
                    }
                    throw new BadRequestException("JSONata request mapping must render to a JSON object");
                });
    }

    private JsonObject parseJson(String raw) {
        try {
            return raw == null || raw.isBlank() ? new JsonObject() : new JsonObject(raw);
        } catch (Exception e) {
            return new JsonObject().put("message", raw);
        }
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
