package com.canonbridge.mappingstudio.billing;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * TASK-032: AI Mapping Assistant configuration.
 * Usage-based pricing: $0.002/1K input tokens, $0.006/1K output tokens.
 * Available on all plans (usage-based billing).
 *
 * Integration with AI Gateway (OpenAI/Anthropic) is handled separately.
 * This config provides pricing and rate limit parameters.
 */
@ApplicationScoped
public class AiMappingAssistantConfig {

    @ConfigProperty(name = "canonbridge.ai.enabled", defaultValue = "false")
    boolean aiEnabled;

    @ConfigProperty(name = "canonbridge.ai.input-token-price-per-1k-cents", defaultValue = "0.2")
    double inputTokenPricePer1kCents;

    @ConfigProperty(name = "canonbridge.ai.output-token-price-per-1k-cents", defaultValue = "0.6")
    double outputTokenPricePer1kCents;

    @ConfigProperty(name = "canonbridge.ai.daily-token-limit-free", defaultValue = "10000")
    int dailyTokenLimitFree;

    @ConfigProperty(name = "canonbridge.ai.daily-token-limit-starter", defaultValue = "100000")
    int dailyTokenLimitStarter;

    @ConfigProperty(name = "canonbridge.ai.daily-token-limit-growth", defaultValue = "500000")
    int dailyTokenLimitGrowth;

    @ConfigProperty(name = "canonbridge.ai.daily-token-limit-scale", defaultValue = "2000000")
    int dailyTokenLimitScale;

    public boolean isEnabled() { return aiEnabled; }

    public int getDailyTokenLimit(String planCode) {
        return switch (planCode) {
            case "free" -> dailyTokenLimitFree;
            case "starter" -> dailyTokenLimitStarter;
            case "growth" -> dailyTokenLimitGrowth;
            case "scale" -> dailyTokenLimitScale;
            case "enterprise" -> Integer.MAX_VALUE;
            default -> dailyTokenLimitFree;
        };
    }

    public double calculateCostCents(int inputTokens, int outputTokens) {
        return (inputTokens / 1000.0) * inputTokenPricePer1kCents
             + (outputTokens / 1000.0) * outputTokenPricePer1kCents;
    }
}
