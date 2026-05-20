package com.canonbridge.mock;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.testcontainers.containers.DockerComposeContainer;

import java.io.File;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertTrue;

@EnabledIfEnvironmentVariable(named = "CANONBRIDGE_PROTOCOL_E2E", matches = "true")
class ProtocolDockerE2ETest {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Test
    void allTenMockSystemsRespondThroughDockerCompose() throws Exception {
        try (DockerComposeContainer<?> compose = new DockerComposeContainer<>(new File("docker-compose.yml"))
                .withLocalCompose(true)
                .withOptions("--compatibility")) {
            compose.start();

            String baseUrl = "http://localhost:8080";
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();
            waitForHealth(client, baseUrl);
            String token = oauthToken(client, baseUrl);

            assertOk(client, get(baseUrl + "/api/payments/latest")
                    .header("X-API-Key", "demo-api-key-12345"), "payment");
            assertOk(client, get(baseUrl + "/api/orders/recent")
                    .header("Authorization", "Bearer " + token), "order");
            assertOk(client, post(baseUrl + "/ws/track", soapTrackRequest())
                    .header("Content-Type", "text/xml")
                    .header("Authorization", basic("fastcargo-demo", "fastcargo-secret")), "TrackingNumber");
            assertOk(client, post(baseUrl + "/graphql", "{\"query\":\"query { customer(id: \\\"CUST-1001\\\") { id email } }\"}")
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + token), "data");
            assertOk(client, post(baseUrl + "/grpc/customer.ProfileService/GetCustomer", "{\"customerId\":\"CUST-1001\"}")
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + token), "customer");
            assertOk(client, get(baseUrl + "/api/foodmarket/orders/FM-1001")
                    .header("Authorization", "Bearer " + token), "orderId");
            assertOk(client, get(baseUrl + "/api/inventorypro/items/SKU-1001")
                    .header("Authorization", "Bearer " + token), "sku");
            assertOk(client, get(baseUrl + "/api/ticketdesk/tickets/TCK-1001")
                    .header("Authorization", "Bearer " + token), "ticketId");
            assertOk(client, get(baseUrl + "/api/cloudbill/invoices/INV-1001")
                    .header("Authorization", "Bearer " + token), "invoiceId");
            assertOk(client, get(baseUrl + "/api/peopleops/employees/EMP-1001")
                    .header("Authorization", "Bearer " + token), "employeeId");
        }
    }

    private void waitForHealth(HttpClient client, String baseUrl) throws Exception {
        long deadline = System.nanoTime() + Duration.ofMinutes(2).toNanos();
        Exception lastError = null;
        while (System.nanoTime() < deadline) {
            try {
                HttpResponse<String> response = client.send(get(baseUrl + "/actuator/health").build(),
                        HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 200) {
                    return;
                }
            } catch (Exception e) {
                lastError = e;
            }
            Thread.sleep(1_000);
        }
        if (lastError != null) {
            throw lastError;
        }
        throw new AssertionError("Mock service health endpoint did not become ready");
    }

    private String oauthToken(HttpClient client, String baseUrl) throws Exception {
        String body = form(
                "grant_type", "client_credentials",
                "client_id", "shopmax-demo-client",
                "client_secret", "shopmax-demo-secret",
                "scope", "read:orders orders.read graphql:query grpc:profile");
        HttpResponse<String> response = client.send(post(baseUrl + "/oauth/token", body)
                        .header("Content-Type", "application/x-www-form-urlencoded")
                        .build(),
                HttpResponse.BodyHandlers.ofString());
        assertTrue(response.statusCode() >= 200 && response.statusCode() < 300, response.body());
        JsonNode json = OBJECT_MAPPER.readTree(response.body());
        return json.get("access_token").asText();
    }

    private void assertOk(HttpClient client, HttpRequest.Builder request, String expectedText) throws Exception {
        HttpResponse<String> response = client.send(request.build(), HttpResponse.BodyHandlers.ofString());
        assertTrue(response.statusCode() >= 200 && response.statusCode() < 300, response.body());
        assertTrue(response.body().contains(expectedText), response.body());
    }

    private HttpRequest.Builder get(String url) {
        return HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(20))
                .GET();
    }

    private HttpRequest.Builder post(String url, String body) {
        return HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(20))
                .POST(HttpRequest.BodyPublishers.ofString(body));
    }

    private String form(String... values) {
        StringBuilder form = new StringBuilder();
        for (int i = 0; i < values.length; i += 2) {
            if (i > 0) {
                form.append('&');
            }
            form.append(URLEncoder.encode(values[i], StandardCharsets.UTF_8));
            form.append('=');
            form.append(URLEncoder.encode(values[i + 1], StandardCharsets.UTF_8));
        }
        return form.toString();
    }

    private String basic(String username, String password) {
        return "Basic " + Base64.getEncoder()
                .encodeToString((username + ":" + password).getBytes(StandardCharsets.UTF_8));
    }

    private String soapTrackRequest() {
        return """
                <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                                  xmlns:trac="http://fastcargo.com/tracking">
                   <soapenv:Body>
                      <trac:GetShipmentStatusRequest>
                         <trac:trackingNumber>FC123456789</trac:trackingNumber>
                      </trac:GetShipmentStatusRequest>
                   </soapenv:Body>
                </soapenv:Envelope>
                """;
    }
}
