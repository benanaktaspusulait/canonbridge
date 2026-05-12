package com.canonbridge.mock.service;

import com.canonbridge.mock.model.payflex.PaymentDetailedResponse;
import com.canonbridge.mock.model.payflex.PaymentFlatResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PayFlexService {

    public PaymentDetailedResponse getLatestPaymentDetailed() {
        var now = Instant.now();
        
        return new PaymentDetailedResponse(
                new PaymentDetailedResponse.Payment(
                        "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                        new PaymentDetailedResponse.Amount(1250.50, "EUR"),
                        "COMPLETED",
                        "INSTANT_TRANSFER",
                        now.minusSeconds(3600),
                        now
                ),
                new PaymentDetailedResponse.Merchant(
                        "MERCH-12345",
                        "TechStore GmbH",
                        "ELECTRONICS",
                        "ORDER-2024-05-001"
                ),
                new PaymentDetailedResponse.Payer(
                        "John Doe",
                        new PaymentDetailedResponse.Account(
                                "DE89370400440532013000",
                                "532013000",
                                "Deutsche Bank"
                        ),
                        "john.doe@example.com",
                        "+49301234567"
                ),
                new PaymentDetailedResponse.Beneficiary(
                        "TechStore GmbH",
                        new PaymentDetailedResponse.Account(
                                "DE89370400440532099999",
                                "532099999",
                                "Commerzbank"
                        ),
                        "COBADEFF"
                ),
                new PaymentDetailedResponse.Risk(
                        0.15,
                        "LOW",
                        List.of("VERIFIED_ACCOUNT", "REGULAR_CUSTOMER")
                ),
                new PaymentDetailedResponse.Settlement(
                        now.plusSeconds(86400).toString(),
                        "PENDING",
                        "BATCH-2024-05-12-001"
                ),
                new PaymentDetailedResponse.Metadata(
                        UUID.randomUUID().toString(),
                        "TRACE-" + System.currentTimeMillis(),
                        "PAYFLEX_API",
                        now
                )
        );
    }

    public PaymentFlatResponse getLatestPaymentFlat() {
        var now = Instant.now();
        
        return new PaymentFlatResponse(
                "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                1250.50,
                "EUR",
                "DE89370400440532013000",
                "DE89370400440532099999",
                "ORDER-2024-05-001",
                now.toString(),
                "LOW",
                "COMPLETED",
                "John Doe",
                "TechStore GmbH",
                now.plusSeconds(86400).toString(),
                UUID.randomUUID().toString()
        );
    }

    public List<PaymentDetailedResponse> queryPayments(Map<String, Object> queryRequest) {
        return List.of(getLatestPaymentDetailed());
    }

    public Map<String, Object> getLargePayload() {
        var now = Instant.now();
        List<Map<String, Object>> transactions = new ArrayList<>();
        for (int i = 0; i < 5000; i++) {
            transactions.add(Map.of(
                    "transactionId", "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                    "amount", 10.0 + i,
                    "currency", "EUR",
                    "status", i % 3 == 0 ? "FAILED" : "COMPLETED",
                    "merchantId", "MERCH-" + (1000 + i % 50),
                    "payerId", "PAYER-" + (2000 + i % 200),
                    "timestamp", now.minusSeconds(i * 60L).toString(),
                    "description", "Payment transaction number " + i + " for demo large payload scenario",
                    "reference", "REF-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16)
            ));
        }
        return Map.of(
                "scenario", "large-payload",
                "totalCount", transactions.size(),
                "generatedAt", now.toString(),
                "transactions", transactions
        );
    }

    public Map<String, Object> getSpecialCharactersPayload() {
        return Map.of(
                "scenario", "special-characters",
                "description", "Edge case payload with unicode, emoji and special characters",
                "unicodeNames", List.of(
                        "Ünsal Çeliköz",
                        "İbrahim Öztürk",
                        "Müge Şahin",
                        "Résumé / naïve / Ångström",
                        "日本語テスト",
                        "中文测试",
                        "한국어 테스트",
                        "Ελληνικά",
                        "العربية",
                        "Ру́сский язы́к"
                ),
                "emojiFields", Map.of(
                        "status", "✅ COMPLETED",
                        "priority", "🔴 HIGH",
                        "category", "🛒 Shopping",
                        "note", "Payment received 💰 — thank you! 🎉",
                        "tags", List.of("🏷️ sale", "⭐ premium", "🚀 express")
                ),
                "specialCharsInValues", Map.of(
                        "xmlEntities", "<payment amount=\"1000\" currency=\"EUR\" & more='data'/>",
                        "jsonSpecial", "quote: \"hello\" \\ backslash \n newline \t tab \r return",
                        "sqlInjection", "'; DROP TABLE payments; --",
                        "htmlEntities", "<script>alert('xss')</script> &amp; &lt;div&gt;",
                        "urlEncoded", "amount=100%2C50&currency=EUR%E2%82%AC",
                        "nullBytes", "before\u0000after",
                        "controlChars", "bell:\u0007 backspace:\u0008 formfeed:\u000C"
                ),
                "largeDecimalAmount", 99999999999.99999,
                "negativeAmount", -0.000001,
                "zeroAmount", 0,
                "emptyStringField", "",
                "nullableField", null,
                "booleanFlags", Map.of(
                        "isTest", true,
                        "isRefund", false
                ),
                "nestedSpecial", Map.of(
                        "merchant", Map.of(
                                "name", "Büro & Schreibwaren GmbH – Müller & Söhne",
                                "address", "Straße des 17. Juni, 10623 Berlin, Deutschland",
                                "vatId", "DE123456789",
                                "description", "Selling 100% organic & natural products; speciality: café goods"
                        )
                ),
                "generatedAt", Instant.now().toString()
        );
    }

    public Map<String, Object> getDeepNestedPayload() {
        return Map.of(
                "scenario", "deep-nested",
                "level1", Map.of(
                        "level2", Map.of(
                                "level3", Map.of(
                                        "level4", Map.of(
                                                "level5", Map.of(
                                                        "level6", Map.of(
                                                                "level7", Map.of(
                                                                        "level8", Map.of(
                                                                                "level9", Map.of(
                                                                                        "level10", Map.of(
                                                                                                "value", "deep-nested-value",
                                                                                                "paymentId", "PAY-DEEP-001",
                                                                                                "amount", 999.99,
                                                                                                "currency", "EUR"
                                                                                        )
                                                                                )
                                                                        )
                                                                )
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );
    }
}
