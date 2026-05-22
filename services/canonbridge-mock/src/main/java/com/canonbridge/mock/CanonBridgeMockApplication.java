package com.canonbridge.mock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CanonBridgeMockApplication {

    public static void main(String[] args) {
        // CM-K1 FIX: Prevent accidental production deployment of mock service
        String env = System.getenv("CANONBRIDGE_ENVIRONMENT");
        String springProfile = System.getenv("SPRING_PROFILES_ACTIVE");

        if (isProduction(env) || isProduction(springProfile)) {
            throw new IllegalStateException(
                    "[FATAL] canonbridge-mock must NOT run in production! " +
                    "This service contains hardcoded test credentials and is for development/testing only. " +
                    "Detected environment: " + env + ", profiles: " + springProfile
            );
        }

        SpringApplication.run(CanonBridgeMockApplication.class, args);
    }

    private static boolean isProduction(String value) {
        if (value == null || value.isBlank()) return false;
        String lower = value.toLowerCase();
        return lower.contains("prod") || lower.contains("production");
    }
}
