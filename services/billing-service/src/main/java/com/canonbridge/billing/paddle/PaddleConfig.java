package com.canonbridge.billing.paddle;

import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithDefault;

@ConfigMapping(prefix = "canonbridge.paddle")
public interface PaddleConfig {

    String apiKey();

    String webhookSecret();

    @WithDefault("sandbox")
    String environment();

    String sellerId();

    @WithDefault("https://sandbox-api.paddle.com")
    String baseUrl();
}
