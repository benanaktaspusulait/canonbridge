package com.canonbridge.billing;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.is;

@QuarkusTest
class BillingServiceHealthTest {

    @Test
    void healthEndpointReturnsUp() {
        RestAssured.given()
            .when().get("/health/live")
            .then()
            .statusCode(200)
            .body("status", is("UP"));
    }
}
