package com.canonbridge.mappingstudio.credential;

import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CredentialSecretCodecTest {

    private static final String TEST_KEY = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

    @Test
    void encryptsAndDecryptsSecretMaterial() {
        CredentialSecretCodec codec = new CredentialSecretCodec(TEST_KEY);
        JsonObject secret = new JsonObject()
                .put("apiKey", "super-secret")
                .put("headerName", "X-Partner-Key");

        String encrypted = codec.encrypt(secret);
        JsonObject decrypted = codec.decrypt(encrypted);

        assertFalse(encrypted.contains("super-secret"));
        assertEquals(secret, decrypted);
    }

    @Test
    void usesDifferentCiphertextForSameSecret() {
        CredentialSecretCodec codec = new CredentialSecretCodec(TEST_KEY);
        JsonObject secret = new JsonObject().put("token", "same-token");

        assertNotEquals(codec.encrypt(secret), codec.encrypt(secret));
    }

    @Test
    void rejectsNonAes256Keys() {
        CredentialSecretCodec codec = new CredentialSecretCodec("c2hvcnQ=");

        assertThrows(IllegalStateException.class, () -> codec.encrypt(new JsonObject().put("apiKey", "secret")));
    }
}
