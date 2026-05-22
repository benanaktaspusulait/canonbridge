package com.canonbridge.billing.paddle;

import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithDefault;

import java.util.Optional;

@ConfigMapping(prefix = "canonbridge.paddle")
public interface PaddleConfig {

    Optional<String> apiKey();

    Optional<String> webhookSecret();

    @WithDefault("sandbox")
    String environment();

    Optional<String> sellerId();

    @WithDefault("https://sandbox-api.paddle.com")
    String baseUrl();
}
