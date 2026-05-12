package com.canonbridge.mappingstudio.outbound;

import com.canonbridge.mappingstudio.credential.CredentialMaterial;
import com.canonbridge.mappingstudio.domain.Credential;
import com.canonbridge.mappingstudio.domain.OutboundConnection;
import com.sun.net.httpserver.HttpServer;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OutboundHttpServiceTest {

    @Test
    void appliesApiKeyCredentialWhenExecutingConnection() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/orders", exchange -> {
            String apiKey = exchange.getRequestHeaders().getFirst("X-Partner-Key");
            byte[] response = new JsonObject()
                    .put("apiKey", apiKey)
                    .put("method", exchange.getRequestMethod())
                    .encode()
                    .getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(201, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();

        try {
            String tenantId = "tenant-acme";
            UUID credentialId = UUID.randomUUID();
            CredentialMaterial credential = new CredentialMaterial(
                    credentialId,
                    tenantId,
                    Credential.AuthType.API_KEY,
                    Credential.Environment.SANDBOX,
                    new JsonObject()
                            .put("headerName", "X-Partner-Key")
                            .put("apiKey", "partner-secret")
            );
            OutboundHttpService service = new OutboundHttpService(
                    (id, tenant) -> Uni.createFrom().item(credential),
                    HttpClient.newHttpClient()
            );
            OutboundConnection connection = new OutboundConnection(
                    UUID.randomUUID(),
                    tenantId,
                    null,
                    "Partner API",
                    OutboundConnection.ConnectionPurpose.DESTINATION,
                    OutboundConnection.Protocol.REST,
                    "POST",
                    "http://localhost:" + server.getAddress().getPort() + "/orders",
                    credentialId,
                    Credential.Environment.SANDBOX,
                    null,
                    3000,
                    null,
                    null,
                    OutboundConnection.ConnectionStatus.NOT_TESTED,
                    null,
                    null,
                    null,
                    null
            );

            OutboundHttpResult result = service.execute(
                    tenantId,
                    connection,
                    new OutboundHttpRequest(new JsonObject().put("orderId", "A-100"), null)
            ).await().indefinitely();

            assertEquals(201, result.statusCode());
            assertTrue(result.success());
            JsonObject body = new JsonObject(result.body());
            assertEquals("partner-secret", body.getString("apiKey"));
            assertEquals("POST", body.getString("method"));
        } finally {
            server.stop(0);
        }
    }
}
