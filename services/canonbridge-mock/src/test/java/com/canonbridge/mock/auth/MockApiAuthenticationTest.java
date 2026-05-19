package com.canonbridge.mock.auth;

import com.canonbridge.mock.config.MockConfiguration;
import com.canonbridge.mock.controller.AdditionalSystemsController;
import com.canonbridge.mock.controller.FastCargoSoapController;
import com.canonbridge.mock.controller.GraphQlController;
import com.canonbridge.mock.controller.GrpcMockController;
import com.canonbridge.mock.controller.ShopMaxController;
import com.canonbridge.mock.controller.ShopMaxOAuthController;
import com.canonbridge.mock.controller.WebhookController;
import com.canonbridge.mock.model.shopmax.TokenResponse;
import com.canonbridge.mock.service.FastCargoService;
import com.canonbridge.mock.service.GraphQlService;
import com.canonbridge.mock.service.GrpcMockService;
import com.canonbridge.mock.service.ShopMaxService;
import com.canonbridge.mock.service.WebhookService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Base64;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

class MockApiAuthenticationTest {

    @TempDir
    Path webhookStorageDir;

    @Test
    void shopMaxRequiresTokenIssuedByOAuthEndpoint() {
        MockConfiguration config = new MockConfiguration();
        MockTokenService tokenService = new MockTokenService(config);
        ShopMaxOAuthController oauthController = new ShopMaxOAuthController(config, tokenService);
        ShopMaxController shopMaxController = new ShopMaxController(new ShopMaxService(), tokenService);

        ResponseEntity<?> rejected = shopMaxController.getRecentOrders("Bearer made-up-token", null, null);
        assertEquals(HttpStatus.UNAUTHORIZED, rejected.getStatusCode());

        ResponseEntity<?> tokenResponse = oauthController.getToken(
                "client_credentials",
                config.getShopmax().getClientId(),
                config.getShopmax().getClientSecret(),
                "read:orders",
                null
        );

        TokenResponse token = assertInstanceOf(TokenResponse.class, tokenResponse.getBody());
        ResponseEntity<?> accepted = shopMaxController.getRecentOrders("Bearer " + token.accessToken(), null, null);
        assertEquals(HttpStatus.OK, accepted.getStatusCode());
    }

    @Test
    void graphQlRejectsCallsWithoutOAuthToken() {
        MockConfiguration config = new MockConfiguration();
        MockTokenService tokenService = new MockTokenService(config);
        GraphQlController controller = new GraphQlController(new GraphQlService(), tokenService);

        ResponseEntity<?> rejected = controller.execute(null, null, Map.of("query", "{ customer { id } }"));
        assertEquals(HttpStatus.UNAUTHORIZED, rejected.getStatusCode());

        String token = tokenService.issueToken("mock-client", "graphql:query").accessToken();
        ResponseEntity<?> accepted = controller.execute("Bearer " + token, null, Map.of("query", "{ customer { id } }"));
        assertEquals(HttpStatus.OK, accepted.getStatusCode());
    }

    @Test
    void grpcRequiresTokenWithGrpcScope() {
        MockConfiguration config = new MockConfiguration();
        MockTokenService tokenService = new MockTokenService(config);
        GrpcMockController controller = new GrpcMockController(new GrpcMockService(), tokenService);

        String orderOnlyToken = tokenService.issueToken("mock-client", "read:orders").accessToken();
        ResponseEntity<?> forbidden = controller.getCustomer("Bearer " + orderOnlyToken, null, Map.of("customerId", "CUST-1"));
        assertEquals(HttpStatus.FORBIDDEN, forbidden.getStatusCode());

        String grpcToken = tokenService.issueToken("mock-client", "grpc:profile").accessToken();
        ResponseEntity<?> accepted = controller.getCustomer("Bearer " + grpcToken, null, Map.of("customerId", "CUST-1"));
        assertEquals(HttpStatus.OK, accepted.getStatusCode());
    }

    @Test
    void webhookEndpointsRequireWebhookKey() {
        MockConfiguration config = new MockConfiguration();
        config.getWebhook().setStorageDir(webhookStorageDir.toString());
        WebhookController controller = new WebhookController(config, new WebhookService(config));

        ResponseEntity<?> rejected = controller.receivePaymentWebhook(null, Map.of("transactionId", "TXN-1"));
        assertEquals(HttpStatus.UNAUTHORIZED, rejected.getStatusCode());

        ResponseEntity<?> accepted = controller.receivePaymentWebhook(
                config.getWebhook().getApiKey(),
                Map.of("transactionId", "TXN-1")
        );
        assertEquals(HttpStatus.OK, accepted.getStatusCode());

        ResponseEntity<?> listRejected = controller.listWebhooks(null, null, 10);
        assertEquals(HttpStatus.UNAUTHORIZED, listRejected.getStatusCode());

        ResponseEntity<?> listAccepted = controller.listWebhooks(config.getWebhook().getApiKey(), null, 10);
        assertEquals(HttpStatus.OK, listAccepted.getStatusCode());
    }

    @Test
    void fastCargoWsdlRequiresBasicAuth() {
        MockConfiguration config = new MockConfiguration();
        FastCargoSoapController controller = new FastCargoSoapController(config, new FastCargoService());

        ResponseEntity<String> rejected = controller.getWsdl(null);
        assertEquals(HttpStatus.UNAUTHORIZED, rejected.getStatusCode());

        String credentials = config.getFastcargo().getUsername() + ":" + config.getFastcargo().getPassword();
        String authorization = "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        ResponseEntity<String> accepted = controller.getWsdl(authorization);
        assertEquals(HttpStatus.OK, accepted.getStatusCode());
    }

    @Test
    void additionalDemoSystemsRequireBearerToken() {
        AdditionalSystemsController controller = new AdditionalSystemsController();

        ResponseEntity<?> rejected = controller.getInventoryItem(null, "SKU-1001");
        assertEquals(HttpStatus.UNAUTHORIZED, rejected.getStatusCode());

        ResponseEntity<?> inventory = controller.getInventoryItem("Bearer demo-token", "SKU-1001");
        assertEquals(HttpStatus.OK, inventory.getStatusCode());

        ResponseEntity<?> ticket = controller.getTicket("Bearer demo-token", "TCK-1001");
        assertEquals(HttpStatus.OK, ticket.getStatusCode());

        ResponseEntity<?> invoice = controller.getInvoice("Bearer demo-token", "INV-1001");
        assertEquals(HttpStatus.OK, invoice.getStatusCode());

        ResponseEntity<?> employee = controller.getEmployee("Bearer demo-token", "EMP-1001");
        assertEquals(HttpStatus.OK, employee.getStatusCode());
    }
}
