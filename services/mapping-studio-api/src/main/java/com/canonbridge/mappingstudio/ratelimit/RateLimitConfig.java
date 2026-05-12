package com.canonbridge.mappingstudio.ratelimit;

import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithDefault;
import io.smallrye.config.WithName;

@ConfigMapping(prefix = "canonbridge.ratelimit")
public interface RateLimitConfig {

    @WithName("enabled")
    @WithDefault("true")
    boolean enabled();

    @WithName("redis-key-prefix")
    @WithDefault("ratelimit:")
    String redisKeyPrefix();

    AuthenticatedConfig authenticated();

    UnauthenticatedConfig unauthenticated();

    interface AuthenticatedConfig {
        @WithName("default-limit")
        @WithDefault("100")
        int defaultLimit();

        @WithName("window-seconds")
        @WithDefault("60")
        int windowSeconds();
    }

    interface UnauthenticatedConfig {
        @WithName("default-limit")
        @WithDefault("10")
        int defaultLimit();

        @WithName("window-seconds")
        @WithDefault("60")
        int windowSeconds();
    }
}
