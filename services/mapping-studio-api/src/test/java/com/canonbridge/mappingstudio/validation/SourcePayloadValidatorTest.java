package com.canonbridge.mappingstudio.validation;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SourcePayloadValidatorTest {

    private final SourcePayloadValidator validator = new SourcePayloadValidator();

    @Test
    void acceptsPayloadThatSatisfiesRequiredFieldsAndTypes() {
        String schema = """
                {
                  "type": "object",
                  "required": ["orderId", "amount"],
                  "properties": {
                    "orderId": { "type": "string" },
                    "amount": { "type": "number" }
                  }
                }
                """;

        SourcePayloadValidator.ValidationResult result =
                validator.validate(schema, "{\"orderId\":\"O-1\",\"amount\":42.5}");

        assertTrue(result.valid());
    }

    @Test
    void rejectsMissingRequiredFields() {
        String schema = """
                {
                  "type": "object",
                  "required": ["orderId"]
                }
                """;

        SourcePayloadValidator.ValidationResult result =
                validator.validate(schema, "{\"amount\":42.5}");

        assertFalse(result.valid());
        assertTrue(result.errors().getFirst().contains("orderId"));
    }

    @Test
    void rejectsTypeMismatch() {
        String schema = """
                {
                  "type": "object",
                  "properties": {
                    "amount": { "type": "number" }
                  }
                }
                """;

        SourcePayloadValidator.ValidationResult result =
                validator.validate(schema, "{\"amount\":\"42.5\"}");

        assertFalse(result.valid());
        assertTrue(result.errors().getFirst().contains("amount"));
    }
}
