package com.canonbridge.mappingstudio.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
class PartnerResourceTest {
    private static final String TENANT_ID = "tenant-acme";

    private io.restassured.specification.RequestSpecification request() {
        return given()
                .header("X-Tenant-Id", TENANT_ID)
                .header("X-API-Key", "partner-resource-test-" + System.nanoTime());
    }

    private static String uniqueExternalId(String prefix) {
        return prefix + "-" + System.nanoTime();
    }

    @Test
    void testListPartners() {
        request()
            .when().get("/api/partners")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("size()", greaterThanOrEqualTo(0));
    }

    @Test
    void testCreatePartner() {
        String externalId = uniqueExternalId("test-partner");
        String partnerJson = """
            {
                "external_id": "%s",
                "name": "Test Partner",
                "description": "Test partner for unit testing"
            }
            """.formatted(externalId);

        request()
            .contentType(ContentType.JSON)
            .body(partnerJson)
            .when().post("/api/partners")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("external_id", notNullValue())
            .body("name", notNullValue());
    }

    @Test
    void testCreatePartnerRejectsDuplicateExternalId() {
        String externalId = uniqueExternalId("duplicate-test-partner");
        String partnerJson = """
            {
                "external_id": "%s",
                "name": "Duplicate Test Partner"
            }
            """.formatted(externalId);

        request()
            .contentType(ContentType.JSON)
            .body(partnerJson)
            .when().post("/api/partners")
            .then()
            .statusCode(201);

        request()
            .contentType(ContentType.JSON)
            .body(partnerJson)
            .when().post("/api/partners")
            .then()
            .statusCode(409);
    }

    @Test
    void testGetPartnerById() {
        // First create a partner
        String externalId = uniqueExternalId("get-test-partner");
        String partnerJson = """
            {
                "external_id": "%s",
                "name": "Get Test Partner"
            }
            """.formatted(externalId);

        String id = request()
            .contentType(ContentType.JSON)
            .body(partnerJson)
            .when().post("/api/partners")
            .then()
            .statusCode(201)
            .extract().path("id");

        // Then retrieve it
        request()
            .when().get("/api/partners/" + id)
            .then()
            .statusCode(200)
            .body("id", notNullValue());
    }

    @Test
    void testUpdatePartner() {
        // Create a partner first
        String externalId = uniqueExternalId("update-test-partner");
        String partnerJson = """
            {
                "external_id": "%s",
                "name": "Update Test Partner"
            }
            """.formatted(externalId);

        String id = request()
            .contentType(ContentType.JSON)
            .body(partnerJson)
            .when().post("/api/partners")
            .then()
            .statusCode(201)
            .extract().path("id");

        // Update it
        String updatedJson = """
            {
                "external_id": "%s",
                "name": "Updated Partner Name",
                "status": "INACTIVE"
            }
            """.formatted(externalId);

        request()
            .contentType(ContentType.JSON)
            .body(updatedJson)
            .when().put("/api/partners/" + id)
            .then()
            .statusCode(200);
    }

    @Test
    void testDeletePartner() {
        // Create a partner first
        String externalId = uniqueExternalId("delete-test-partner");
        String partnerJson = """
            {
                "external_id": "%s",
                "name": "Delete Test Partner"
            }
            """.formatted(externalId);

        String id = request()
            .contentType(ContentType.JSON)
            .body(partnerJson)
            .when().post("/api/partners")
            .then()
            .statusCode(201)
            .extract().path("id");

        // Delete it
        request()
            .when().delete("/api/partners/" + id)
            .then()
            .statusCode(204);

        // Verify it's gone
        request()
            .when().get("/api/partners/" + id)
            .then()
            .statusCode(404);
    }
}
