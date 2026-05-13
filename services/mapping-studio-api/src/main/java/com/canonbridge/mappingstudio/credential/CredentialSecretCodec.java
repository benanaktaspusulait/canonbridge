package com.canonbridge.mappingstudio.credential;

import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

@ApplicationScoped
public class CredentialSecretCodec {

    private static final String CIPHER = "AES/GCM/NoPadding";
    private static final String KEY_ALGORITHM = "AES";
    private static final int IV_BYTES = 12;
    private static final int GCM_TAG_BITS = 128;

    private final SecureRandom secureRandom = new SecureRandom();

    @ConfigProperty(
            name = "canonbridge.credentials.encryption-key",
            defaultValue = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
    )
    String configuredBase64Key;

    CredentialSecretCodec() {
    }

    CredentialSecretCodec(String configuredBase64Key) {
        this.configuredBase64Key = configuredBase64Key;
    }

    public String encrypt(JsonObject secret) {
        if (secret == null || secret.isEmpty()) {
            throw new IllegalArgumentException("Credential secret must not be empty");
        }

        byte[] iv = new byte[IV_BYTES];
        secureRandom.nextBytes(iv);

        try {
            Cipher cipher = Cipher.getInstance(CIPHER);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey(), new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] ciphertext = cipher.doFinal(secret.encode().getBytes(StandardCharsets.UTF_8));

            return new JsonObject()
                    .put("v", 1)
                    .put("alg", "AES-256-GCM")
                    .put("iv", Base64.getEncoder().encodeToString(iv))
                    .put("ciphertext", Base64.getEncoder().encodeToString(ciphertext))
                    .encode();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Failed to encrypt credential secret", e);
        }
    }

    public JsonObject decrypt(String encryptedSecretJson) {
        if (encryptedSecretJson == null || encryptedSecretJson.isBlank()) {
            throw new IllegalArgumentException("Encrypted credential secret must not be empty");
        }

        JsonObject envelope = new JsonObject(encryptedSecretJson);
        
        // If it's plain JSON (no "alg" field), return as-is for development
        if (!envelope.containsKey("alg")) {
            System.out.println("DEBUG: Plain JSON credential detected, returning as-is");
            return envelope;
        }
        
        if (!"AES-256-GCM".equals(envelope.getString("alg"))) {
            throw new IllegalArgumentException("Unsupported credential secret algorithm");
        }

        try {
            byte[] iv = Base64.getDecoder().decode(envelope.getString("iv"));
            byte[] ciphertext = Base64.getDecoder().decode(envelope.getString("ciphertext"));
            Cipher cipher = Cipher.getInstance(CIPHER);
            cipher.init(Cipher.DECRYPT_MODE, secretKey(), new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] plaintext = cipher.doFinal(ciphertext);
            return new JsonObject(new String(plaintext, StandardCharsets.UTF_8));
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            throw new IllegalStateException("Failed to decrypt credential secret", e);
        }
    }

    private SecretKeySpec secretKey() {
        byte[] keyBytes = Base64.getDecoder().decode(configuredBase64Key);
        if (keyBytes.length != 32) {
            throw new IllegalStateException("Credential encryption key must decode to 32 bytes for AES-256");
        }
        return new SecretKeySpec(keyBytes, KEY_ALGORITHM);
    }
}
