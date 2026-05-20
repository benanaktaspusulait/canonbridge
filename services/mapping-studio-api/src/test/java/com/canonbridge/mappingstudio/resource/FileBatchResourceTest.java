package com.canonbridge.mappingstudio.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
class FileBatchResourceTest {

    private static final String TENANT_ID = "tenant-acme";

    private RequestSpecification request() {
        return given()
                .header("X-Tenant-Id", TENANT_ID)
                .header("X-User-Id", "file-batch-test-user")
                .header("X-API-Key", "file-batch-resource-test-" + System.nanoTime());
    }

    @Test
    void chunkedUploadSessionTracksChunksAndRejectsIncompleteCompletion() {
        String draftId = createFileBatchDraft();

        String sessionId = request()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "fileName": "orders.jsonl",
                          "contentType": "application/jsonl",
                          "expectedChunks": 2,
                          "expectedRows": 3,
                          "metadata": { "source": "unit-test" }
                        }
                        """)
                .when().post("/api/mapping-drafts/{id}/batch/sessions", draftId)
                .then()
                .statusCode(201)
                .contentType(ContentType.JSON)
                .body("sessionId", notNullValue())
                .body("status", equalTo("OPEN"))
                .body("expectedChunks", equalTo(2))
                .extract().path("sessionId");

        request()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "chunkIndex": 0,
                          "rows": [
                            { "orderId": "B-1001", "amount": 42.5 },
                            { "orderId": "B-1002", "amount": 17.0 }
                          ]
                        }
                        """)
                .when().post("/api/mapping-drafts/{id}/batch/sessions/{sessionId}/chunks", draftId, sessionId)
                .then()
                .statusCode(200)
                .body("status", equalTo("RECEIVING"))
                .body("receivedChunks", equalTo(1))
                .body("receivedRows", equalTo(2));

        request()
                .when().post("/api/mapping-drafts/{id}/batch/sessions/{sessionId}/complete", draftId, sessionId)
                .then()
                .statusCode(409)
                .body("expectedChunks", equalTo(2))
                .body("receivedChunks", equalTo(1));

        request()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "chunkIndex": 1,
                          "records": [
                            { "orderId": "B-1003", "amount": 99.0 }
                          ]
                        }
                        """)
                .when().post("/api/mapping-drafts/{id}/batch/sessions/{sessionId}/chunks", draftId, sessionId)
                .then()
                .statusCode(200)
                .body("receivedChunks", equalTo(2))
                .body("receivedRows", equalTo(3));

        request()
                .when().get("/api/mapping-drafts/{id}/batch/sessions/{sessionId}", draftId, sessionId)
                .then()
                .statusCode(200)
                .body("status", equalTo("RECEIVING"))
                .body("chunks.size()", equalTo(2))
                .body("chunks[0].chunkIndex", equalTo(0))
                .body("chunks[1].chunkIndex", equalTo(1));

        request()
                .when().get("/api/mapping-drafts/{id}/batch/sessions", draftId)
                .then()
                .statusCode(200)
                .body("sessions.size()", greaterThanOrEqualTo(1));

        request()
                .when().post("/api/mapping-drafts/{id}/batch/sessions/{sessionId}/cancel", draftId, sessionId)
                .then()
                .statusCode(200)
                .body("status", equalTo("CANCELLED"));
    }

    private String createFileBatchDraft() {
        String partnerId = request()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "external_id": "file-batch-test-%s",
                          "name": "File Batch Test Partner"
                        }
                        """.formatted(System.nanoTime()))
                .when().post("/api/partners")
                .then()
                .statusCode(201)
                .extract().path("id");

        return request()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "partner_id": "%s",
                          "event_type": "batch.orders.test",
                          "name": "Chunked Batch Test Mapping",
                          "description": "Test mapping for chunked batch session APIs",
                          "source_type": "FILE_BATCH",
                          "source_config": "{}",
                          "input_schema": "{}",
                          "mapping_rules": "[]",
                          "generated_jsonata": "$",
                          "validation_rules": "{}",
                          "status": "VALID"
                        }
                        """.formatted(partnerId))
                .when().post("/api/mapping-drafts")
                .then()
                .statusCode(201)
                .extract().path("id");
    }
}
