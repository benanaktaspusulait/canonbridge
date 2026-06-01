package com.canonbridge.mock.service;

import com.canonbridge.mock.config.MockConfiguration;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(prefix = "mock.kafka.event-generator", name = "enabled", havingValue = "true", matchIfMissing = true)
public class KafkaEventGeneratorService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final MockConfiguration mockConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Scheduled(fixedDelayString = "#{${mock.kafka.event-generator.shopmax-interval-seconds:30} * 1000}")
    public void generateShopMaxOrderEvent() {
        try {
            // [CM-H3] Inject malformed events periodically to test DLQ/error handling
            if (ThreadLocalRandom.current().nextInt(10) == 0) {
                generateMalformedEvent();
                return;
            }

            var orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            var now = Instant.now();

            var orderEvent = Map.of(
                    "eventId", UUID.randomUUID().toString(),
                    "eventType", "ORDER_CREATED",
                    "timestamp", now.toString(),
                    "source", "SHOPMAX_KAFKA",
                    "order", Map.of(
                            "orderId", orderId,
                            "buyer", "Customer-" + ThreadLocalRandom.current().nextInt(1000, 9999),
                            "items", List.of(
                                    Map.of(
                                            "sku", "SKU-" + ThreadLocalRandom.current().nextInt(100, 999),
                                            "quantity", ThreadLocalRandom.current().nextInt(1, 5),
                                            "price", ThreadLocalRandom.current().nextDouble(10.0, 500.0)
                                    )
                            ),
                            "total", ThreadLocalRandom.current().nextDouble(50.0, 2000.0),
                            "currency", "EUR",
                            "status", "CONFIRMED"
                    )
            );

            String json = objectMapper.writeValueAsString(orderEvent);
            kafkaTemplate.send(mockConfig.getKafka().getTopics().getShopmaxRaw(), orderId, json);
            
            log.info("Generated ShopMax order event: {}", orderId);
        } catch (Exception e) {
            log.error("Error generating ShopMax order event", e);
        }
    }

    @Scheduled(fixedDelayString = "#{${mock.kafka.event-generator.cargo-interval-seconds:120} * 1000}")
    public void generateCargoUpdateEvent() {
        try {
            var trackingNumber = "FC" + ThreadLocalRandom.current().nextInt(100000, 999999);
            var now = Instant.now();

            var statuses = List.of("IN_TRANSIT", "DELIVERED", "DELAYED", "CUSTOMS_HOLD", "ADDRESS_EXCEPTION");
            var status = statuses.get(ThreadLocalRandom.current().nextInt(statuses.size()));

            var cargoEvent = Map.of(
                    "eventId", UUID.randomUUID().toString(),
                    "eventType", "CARGO_UPDATE",
                    "timestamp", now.toString(),
                    "source", "FASTCARGO_POLLER",
                    "shipment", Map.of(
                            "trackingNumber", trackingNumber,
                            "status", status,
                            "checkpoint", Map.of(
                                    "location", "Distribution Center",
                                    "city", "Berlin",
                                    "country", "DE",
                                    "timestamp", now.toString(),
                                    "description", "Package " + status.toLowerCase().replace("_", " ")
                            ),
                            "weight", ThreadLocalRandom.current().nextDouble(0.5, 25.0),
                            "weightUnit", "KG"
                    )
            );

            String json = objectMapper.writeValueAsString(cargoEvent);
            kafkaTemplate.send(mockConfig.getKafka().getTopics().getCargoUpdates(), trackingNumber, json);
            
            log.info("Generated cargo update event: {} - {}", trackingNumber, status);
        } catch (Exception e) {
            log.error("Error generating cargo update event", e);
        }
    }

    /**
     * [CM-H3] Generate malformed events to test DLQ/error handling in consumers.
     * Randomly picks one of several error scenarios.
     */
    private void generateMalformedEvent() {
        try {
            int scenario = ThreadLocalRandom.current().nextInt(4);
            String key = "MALFORMED-" + UUID.randomUUID().toString().substring(0, 8);
            String payload = switch (scenario) {
                case 0 -> "this is not valid json {{{";
                case 1 -> objectMapper.writeValueAsString(Map.of(
                        "eventId", UUID.randomUUID().toString(),
                        "eventType", "ORDER_CREATED",
                        "timestamp", Instant.now().toString()
                        // Missing required "order" field
                ));
                case 2 -> objectMapper.writeValueAsString(Map.of(
                        "eventId", UUID.randomUUID().toString(),
                        "eventType", "ORDER_CREATED",
                        "timestamp", Instant.now().toString(),
                        "order", Map.of(
                                "orderId", "", // Empty required field
                                "total", "not-a-number", // Wrong type
                                "currency", "INVALID_CURRENCY_CODE_TOO_LONG"
                        )
                ));
                default -> objectMapper.writeValueAsString(Map.of(
                        "eventId", UUID.randomUUID().toString(),
                        "eventType", "UNKNOWN_EVENT_TYPE",
                        "timestamp", Instant.now().toString(),
                        "data", Map.of("unexpected", "schema")
                ));
            };

            kafkaTemplate.send(mockConfig.getKafka().getTopics().getShopmaxRaw(), key, payload);
            log.warn("[CM-H3] Generated malformed event (scenario {}): {}", scenario, key);
        } catch (Exception e) {
            log.error("Error generating malformed event", e);
        }
    }
}
