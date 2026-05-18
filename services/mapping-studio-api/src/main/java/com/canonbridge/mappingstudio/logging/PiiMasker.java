package com.canonbridge.mappingstudio.logging;

import java.util.Set;
import java.util.regex.Pattern;

/**
 * Masks PII (Personally Identifiable Information) in log output.
 * 
 * Sensitive fields are replaced with masked values:
 * - email → ***@domain.com
 * - phone → ***
 * - token/key → ***
 * - card numbers → ****1234
 */
public class PiiMasker {

    private static final Set<String> SENSITIVE_KEYS = Set.of(
        "email", "customerEmail", "customer_email", "userEmail",
        "phone", "phoneNumber", "phone_number", "mobile",
        "password", "secret", "token", "apiKey", "api_key",
        "bearerToken", "bearer_token", "webhookKey", "webhook_key",
        "authorization", "Authorization",
        "cardNumber", "card_number", "cardLast4",
        "iban", "accountNumber", "account_number",
        "nationalId", "national_id", "taxId", "tax_id",
        "ssn", "socialSecurityNumber"
    );

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
    );

    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "\\+?[0-9\\s\\-()]{8,15}"
    );

    /**
     * Check if a field name is sensitive and should be masked.
     */
    public static boolean isSensitive(String fieldName) {
        if (fieldName == null) return false;
        String lower = fieldName.toLowerCase();
        return SENSITIVE_KEYS.stream().anyMatch(k -> k.toLowerCase().equals(lower))
            || lower.contains("password")
            || lower.contains("secret")
            || lower.contains("token")
            || lower.contains("key")
            || lower.contains("credential");
    }

    /**
     * Mask a value based on its field name.
     */
    public static String mask(String fieldName, String value) {
        if (value == null || value.isBlank()) return value;
        
        String lower = fieldName.toLowerCase();
        
        if (lower.contains("email")) {
            int atIndex = value.indexOf('@');
            if (atIndex > 0) {
                return "***" + value.substring(atIndex);
            }
        }
        
        if (lower.contains("phone") || lower.contains("mobile")) {
            return "***";
        }
        
        if (lower.contains("card") && value.length() >= 4) {
            return "****" + value.substring(value.length() - 4);
        }
        
        // Default: show first 2 chars + mask
        if (value.length() > 4) {
            return value.substring(0, 2) + "***";
        }
        
        return "***";
    }

    /**
     * Mask sensitive values in a JSON string (simple regex-based).
     * For production, use a proper JSON parser.
     */
    public static String maskJsonString(String json) {
        if (json == null) return null;
        
        // Mask emails
        String masked = EMAIL_PATTERN.matcher(json).replaceAll(match -> {
            String email = match.group();
            int at = email.indexOf('@');
            return "***" + email.substring(at);
        });
        
        return masked;
    }
}
