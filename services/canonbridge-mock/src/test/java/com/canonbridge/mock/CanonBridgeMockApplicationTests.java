package com.canonbridge.mock;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@EmbeddedKafka(partitions = 1, topics = {
        "partner.payflex.raw",
        "partner.shopmax.raw",
        "cargo.updates",
        "canonbridge.retry.demo",
        "canonbridge.dlq.demo"
})
class CanonBridgeMockApplicationTests {

    @Test
    void contextLoads() {
    }
}
