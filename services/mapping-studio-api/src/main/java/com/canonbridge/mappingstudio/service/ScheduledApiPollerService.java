package com.canonbridge.mappingstudio.service;

import com.canonbridge.mappingstudio.domain.MappingDraft;
import com.canonbridge.mappingstudio.kafka.KafkaProducerService;
import com.canonbridge.mappingstudio.repository.MappingDraftRepository;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@ApplicationScoped
public class ScheduledApiPollerService {

    private static final Logger LOG = Logger.getLogger(ScheduledApiPollerService.class);

    @Inject
    MappingDraftRepository draftRepository;

    @Inject
    MappingExecutionService executionService;

    @Inject
    KafkaProducerService kafkaProducerService;

    @ConfigProperty(name = "canonbridge.scheduled-poller.enabled", defaultValue = "true")
    boolean enabled;

    @ConfigProperty(name = "canonbridge.scheduled-poller.tick-seconds", defaultValue = "60")
    long tickSeconds;

    @ConfigProperty(name = "canonbridge.scheduled-poller.default-interval", defaultValue = "PT15M")
    String defaultInterval;

    private final AtomicBoolean running = new AtomicBoolean(false);
    private final Map<UUID, Instant> lastRuns = new ConcurrentHashMap<>();
    private ScheduledExecutorService executor;

    @PostConstruct
    void start() {
        if (!enabled) {
            LOG.info("Scheduled API poller disabled");
            return;
        }
        executor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread thread = new Thread(r, "scheduled-api-poller");
            thread.setDaemon(true);
            return thread;
        });
        long delaySeconds = Math.max(5, tickSeconds);
        executor.scheduleWithFixedDelay(this::pollSafely, delaySeconds, delaySeconds, TimeUnit.SECONDS);
        LOG.infof("Scheduled API poller started with %d second tick", delaySeconds);
    }

    @PreDestroy
    void stop() {
        if (executor != null) {
            executor.shutdownNow();
        }
    }

    void pollSafely() {
        if (!running.compareAndSet(false, true)) {
            return;
        }

        draftRepository.findRunnableScheduledApiMappings()
                .subscribe().with(
                        this::runDueMappings,
                        error -> {
                            running.set(false);
                            LOG.warnf("Scheduled API poller failed to load mappings: %s", error.getMessage());
                        }
                );
    }

    private void runDueMappings(List<MappingDraft> mappings) {
        List<Uni<Void>> jobs = new ArrayList<>();
        Instant now = Instant.now();

        for (MappingDraft mapping : mappings) {
            JsonObject sourceConfig = parseSourceConfig(mapping);
            String url = sourceConfig.getString("url");
            String schedule = sourceConfig.getString("schedule");
            if (url == null || url.isBlank() || schedule == null || schedule.isBlank()) {
                continue;
            }

            Duration interval = parseInterval(schedule);
            Instant lastRun = lastRuns.get(mapping.getId());
            if (lastRun != null && lastRun.plus(interval).isAfter(now)) {
                continue;
            }

            lastRuns.put(mapping.getId(), now);
            jobs.add(runMapping(mapping));
        }

        if (jobs.isEmpty()) {
            running.set(false);
            return;
        }

        Uni.combine().all().unis(jobs)
                .discardItems()
                .subscribe().with(
                        ignored -> running.set(false),
                        error -> {
                            running.set(false);
                            LOG.warnf("Scheduled API poller run finished with errors: %s", error.getMessage());
                        }
                );
    }

    private Uni<Void> runMapping(MappingDraft mapping) {
        return executionService.executeMapping(mapping, "{}", null)
                .chain(result -> {
                    if (!result.success()) {
                        LOG.warnf("Scheduled API mapping failed: %s (%s)", mapping.getName(), result.error());
                        return Uni.createFrom().voidItem();
                    }
                    JsonNode canonical = result.transformedResponse();
                    if (canonical == null) {
                        return Uni.createFrom().voidItem();
                    }
                    String key = buildMessageKey(mapping, canonical);
                    return kafkaProducerService.publishCanonicalEvent(
                            key,
                            canonical.toString(),
                            mapping.getPartnerId() != null ? mapping.getPartnerId().toString() : null,
                            mapping.getEventType());
                })
                .onFailure().recoverWithUni(error -> {
                    LOG.warnf("Scheduled API mapping execution failed for %s: %s", mapping.getName(), error.getMessage());
                    return Uni.createFrom().voidItem();
                });
    }

    private JsonObject parseSourceConfig(MappingDraft mapping) {
        try {
            return mapping.getSourceConfig() != null && !mapping.getSourceConfig().isBlank()
                    ? new JsonObject(mapping.getSourceConfig())
                    : new JsonObject();
        } catch (Exception e) {
            return new JsonObject();
        }
    }

    private Duration parseInterval(String schedule) {
        String raw = schedule.trim();
        try {
            if (raw.toUpperCase(Locale.ROOT).startsWith("PT")) {
                return Duration.parse(raw);
            }
        } catch (Exception ignored) {
        }

        String lower = raw.toLowerCase(Locale.ROOT);
        if (lower.matches("\\d+[smhd]")) {
            long amount = Long.parseLong(lower.substring(0, lower.length() - 1));
            return switch (lower.charAt(lower.length() - 1)) {
                case 's' -> Duration.ofSeconds(amount);
                case 'm' -> Duration.ofMinutes(amount);
                case 'h' -> Duration.ofHours(amount);
                case 'd' -> Duration.ofDays(amount);
                default -> fallbackInterval();
            };
        }
        if (lower.startsWith("*/") && lower.contains(" ")) {
            String minutes = lower.substring(2, lower.indexOf(' '));
            try {
                return Duration.ofMinutes(Long.parseLong(minutes));
            } catch (Exception ignored) {
            }
        }
        if ("@hourly".equals(lower) || "hourly".equals(lower)) {
            return Duration.ofHours(1);
        }
        if ("@daily".equals(lower) || "daily".equals(lower)) {
            return Duration.ofDays(1);
        }
        return fallbackInterval();
    }

    private Duration fallbackInterval() {
        try {
            return Duration.parse(defaultInterval);
        } catch (Exception e) {
            return Duration.ofMinutes(15);
        }
    }

    private String buildMessageKey(MappingDraft mapping, JsonNode canonicalNode) {
        String discoveredKey = findText(canonicalNode, "eventId", "id", "orderId", "paymentId", "customerId");
        if (discoveredKey != null && !discoveredKey.isBlank()) {
            return discoveredKey;
        }
        String mappingId = mapping.getId() != null ? mapping.getId().toString() : "scheduled-api";
        return mappingId + "-" + Instant.now().toEpochMilli();
    }

    private String findText(JsonNode node, String... fieldNames) {
        if (node == null || !node.isObject()) return null;
        for (String fieldName : fieldNames) {
            JsonNode value = node.get(fieldName);
            if (value != null && value.isValueNode()) {
                return value.asText();
            }
        }
        return null;
    }
}
