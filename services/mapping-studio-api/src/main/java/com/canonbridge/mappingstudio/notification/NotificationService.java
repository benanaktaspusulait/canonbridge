package com.canonbridge.mappingstudio.notification;

import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;

@ApplicationScoped
public class NotificationService {

    @Inject
    NotificationSocket socket;

    public void mappingPublished(String tenantId, String mappingId, String name, Integer version) {
        socket.broadcast(new JsonObject()
            .put("type", "mapping.published")
            .put("tenantId", tenantId)
            .put("mappingId", mappingId)
            .put("name", name)
            .put("version", version)
            .put("timestamp", Instant.now().toString())
            .encode());
    }

    public void alertFired(String tenantId, String severity, String title, String detail) {
        socket.broadcast(new JsonObject()
            .put("type", "alert.fired")
            .put("tenantId", tenantId)
            .put("severity", severity)
            .put("title", title)
            .put("detail", detail)
            .put("timestamp", Instant.now().toString())
            .encode());
    }
}
