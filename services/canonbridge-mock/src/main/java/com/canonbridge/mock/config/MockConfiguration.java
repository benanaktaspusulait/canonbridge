package com.canonbridge.mock.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "mock")
@Data
public class MockConfiguration {

    private PayFlexConfig payflex = new PayFlexConfig();
    private ShopMaxConfig shopmax = new ShopMaxConfig();
    private FastCargoConfig fastcargo = new FastCargoConfig();
    private WebhookConfig webhook = new WebhookConfig();
    private KafkaConfig kafka = new KafkaConfig();

    @Data
    public static class PayFlexConfig {
        private String apiKey = "demo-api-key-12345";
    }

    @Data
    public static class ShopMaxConfig {
        private String clientId = "shopmax-demo-client";
        private String clientSecret = "shopmax-demo-secret";
        private int tokenExpirySeconds = 3600;
    }

    @Data
    public static class FastCargoConfig {
        private String username = "fastcargo-demo";
        private String password = "fastcargo-secret";
    }

    @Data
    public static class WebhookConfig {
        private String storageDir = "/tmp/webhooks";
    }

    @Data
    public static class KafkaConfig {
        private TopicsConfig topics = new TopicsConfig();
        private EventGeneratorConfig eventGenerator = new EventGeneratorConfig();
    }

    @Data
    public static class TopicsConfig {
        private String payflexRaw = "partner.payflex.raw";
        private String shopmaxRaw = "partner.shopmax.raw";
        private String cargoUpdates = "cargo.updates";
        private String retryDemo = "canonbridge.retry.demo";
        private String dlqDemo = "canonbridge.dlq.demo";
    }

    @Data
    public static class EventGeneratorConfig {
        private boolean enabled = true;
        private int shopmaxIntervalSeconds = 30;
        private int cargoIntervalSeconds = 120;
    }
}
