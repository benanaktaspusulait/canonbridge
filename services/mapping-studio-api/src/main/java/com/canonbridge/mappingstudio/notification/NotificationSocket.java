package com.canonbridge.mappingstudio.notification;

import com.canonbridge.mappingstudio.security.ApiKeyAuthenticator;
import jakarta.inject.Inject;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnOpen;
import jakarta.websocket.CloseReason;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
@ServerEndpoint("/api/notifications/ws")
public class NotificationSocket {

    private final Set<Session> sessions = ConcurrentHashMap.newKeySet();

    @Inject
    ApiKeyAuthenticator apiKeyAuthenticator;

    @ConfigProperty(name = "canonbridge.notifications.websocket.auth-required", defaultValue = "true")
    boolean authRequired;

    @OnOpen
    public void onOpen(Session session) {
        if (authRequired && !isAuthenticated(session)) {
            closeUnauthorized(session);
            return;
        }
        sessions.add(session);
    }

    @OnClose
    public void onClose(Session session) {
        sessions.remove(session);
    }

    void broadcast(String message) {
        for (Session session : sessions) {
            if (session.isOpen()) {
                session.getAsyncRemote().sendText(message);
            }
        }
    }

    private boolean isAuthenticated(Session session) {
        Map<String, List<String>> params = session.getRequestParameterMap();
        String token = first(params, "token");
        String apiKey = first(params, "apiKey");
        if ((token == null || token.isBlank()) && (apiKey == null || apiKey.isBlank())) {
            return false;
        }
        ApiKeyAuthenticator.AuthenticationResult result = apiKeyAuthenticator.authenticate(
                token != null && !token.isBlank() ? "Bearer " + token : null,
                apiKey);
        return result.authenticated();
    }

    private String first(Map<String, List<String>> params, String key) {
        List<String> values = params.get(key);
        if (values == null || values.isEmpty()) {
            return null;
        }
        return values.get(0);
    }

    private void closeUnauthorized(Session session) {
        try {
            session.close(new CloseReason(
                    CloseReason.CloseCodes.VIOLATED_POLICY,
                    "Missing or invalid notification websocket credentials"));
        } catch (IOException ignored) {
        }
    }
}
