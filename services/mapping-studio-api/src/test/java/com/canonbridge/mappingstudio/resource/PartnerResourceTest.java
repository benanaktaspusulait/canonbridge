package com.canonbridge.mappingstudio.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
class PartnerResourceTest {

    @Test
    void testListPartners() {
        given()
            .when().get("/api/partners")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("size()", greaterThanOrEqualTo(0));
    }

    @Test
    void testCreatePartner() {
        String partnerJson = """
            {
                "partnerId": "test-partner",
                "name": "Test Partner",
                "description": "Test partner for unit testing",
                "active": true
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(partnerJson)
            .when().post("/api/partners")
            .then()
            .statusCode(201)
            .body("partnerId", notNullValue())
            .body("name", notNullValue());
    }

    @Test
    void testGetPartnerById() {
        // First create a partner
        String partnerJson = """
            {
                "partnerId": "get-test-partner",
                "name": "Get Test Partner",
                "active": true
            }
            """;

        String partnerId = given()
            .contentType(ContentType.JSON)
            .body(partnerJson)
            .when().post("/api/partners")
            .then()
            .statusCode(201)
            .extract().path("partnerId");

        // Then retrieve it
        given()
            .when().get("/api/partners/" + partnerId)
            .then()
            .statusCode(200)
            .body("partnerId", notNullValue());
    }

    @Test
    void testUpdatePartner() {
        // Create a partner first
        String partnerJson = """
            {
                "partnerId": "update-test-partner",
                "name": "Update Test Partner",
                "active": true
            }
            """;

        String partnerId = given()
            .contentType(ContentType.JSON)
            .body(partnerJson)
            .when().post("/api/partners")
            .then()
            .statusCode(201)
            .extract().path("partnerId");

        // Update it
        String updatedJson = """
            {
                "partnerId": "update-test-partner",
                "name": "Updated Partner Name",
                "active": false
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(updatedJson)
            .when().put("/api/partners/" + partnerId)
            .then()
            .statusCode(200);
    }

    @Test
    void testDeletePartner() {
        // Create a partner first
        String partnerJson = """
            {
                "partnerId": "delete-test-partner",
                "name": "Delete Test Partner",
                "active": true
            }
            """;

        String partnerId = given()
            .contentType(ContentType.JSON)
            .body(partnerJson)
            .when().post("/api/partners")
            .then()
            .statusCode(201)
            .extract().path("partnerId");

        // Delete it
        given()
            .when().delete("/api/partners/" + partnerId)
            .then()
            .statusCode(204);

        // Verify it's gone
        given()
            .when().get("/api/partners/" + partnerId)
            .then()
            .statusCode(404);
    }
}
