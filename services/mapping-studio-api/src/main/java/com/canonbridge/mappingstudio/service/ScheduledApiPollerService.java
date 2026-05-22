package com.canonbridge.mappingstudio.service;

import com.canonbridge.mappingstudio.domain.MappingDraft;
import com.canonbridge.mappingstudio.kafka.KafkaProducerService;
import com.canonbridge.mappingstudio.repository.MappingDraftRepository;
import com.canonbridge.mappingstudio.repository.ScheduledApiRunRepository;
import com.canonbridge.mappingstudio.security.TenantContext;
import com.fasterxml.jackson.databind.JsonNode;
import io.micrometer.core.instrument.MeterRegistry;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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

    @Inject
    ScheduledApiRunRepository scheduledApiRunRepository;

    @Inject
    TenantContext tenantContext;

    @Inject
    MeterRegistry meterRegistry;

    @Inject
    LeaderLockService leaderLockService;

    @ConfigProperty(name = "canonbridge.scheduled-poller.enabled", defaultValue = "true")
    boolean enabled;

    @ConfigProperty(name = "canonbridge.scheduled-poller.tick-seconds", defaultValue = "60")
    long tickSeconds;

    @ConfigProperty(name = "canonbridge.scheduled-poller.default-interval", defaultValue = "PT15M")
    String defaultInterval;

    private final AtomicBoolean running = new AtomicBoolean(false);
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

        LeaderLockService lockService = leaderLockService != null ? leaderLockService : new LeaderLockService();
        lockService.withLock(
                        "canonbridge.scheduled-api-poller",
                        () -> draftRepository.findRunnableScheduledApiMappings().chain(this::runDueMappings),
                        0)
                .subscribe().with(
                        ignored -> running.set(false),
                        error -> {
                            running.set(false);
                            LOG.warnf("Scheduled API poller failed to load mappings: %s", error.getMessage());
                        }
                );
    }

    private Uni<Integer> runDueMappings(List<MappingDraft> mappings) {
        List<Uni<Void>> jobs = new ArrayList<>();
        Instant now = Instant.now();

        for (MappingDraft mapping : mappings) {
            JsonObject sourceConfig = parseSourceConfig(mapping);
            String url = sourceConfig.getString("url");
            String schedule = sourceConfig.getString("schedule");
            if (url == null || url.isBlank() || schedule == null || schedule.isBlank()) {
                continue;
            }

            String tenantId = tenantId(mapping);
            jobs.add(scheduledApiRunRepository.findSummary(tenantId, mapping.getId())
                    .chain(runState -> {
                        Instant nextDueAt = instantFrom(runState, "nextRunAt");
                        if (nextDueAt != null && nextDueAt.isAfter(now)) {
                            return Uni.createFrom().voidItem();
                        }
                        Instant startedAt = Instant.now();
                        Instant nextRunAt = nextRunAfter(schedule, startedAt);
                        return scheduledApiRunRepository.markStarted(tenantId, mapping.getId(), startedAt, nextRunAt)
                                .chain(runId -> runMapping(mapping, startedAt, runId));
                    }));
        }

        if (jobs.isEmpty()) {
            return Uni.createFrom().item(0);
        }

        return Uni.combine().all().unis(jobs)
                .discardItems()
                .replaceWith(jobs.size());
    }

    private Uni<Void> runMapping(MappingDraft mapping, Instant startedAt, java.util.UUID runId) {
        String tenantId = tenantId(mapping);
        return executionService.executeMapping(mapping, "{}", null)
                .chain(result -> {
                    if (!result.success()) {
                        LOG.warnf("Scheduled API mapping failed: %s (%s)", mapping.getName(), result.error());
                        return scheduledApiRunRepository.markCompleted(
                                tenantId,
                                mapping.getId(),
                                runId,
                                startedAt,
                                false,
                                null,
                                result.error())
                                .invoke(() -> recordScheduledRun("failure"));
                    }
                    JsonNode canonical = result.transformedResponse();
                    if (canonical == null) {
                        return scheduledApiRunRepository.markCompleted(
                                tenantId,
                                mapping.getId(),
                                runId,
                                startedAt,
                                false,
                                null,
                                "Mapping produced no canonical payload")
                                .invoke(() -> recordScheduledRun("failure"));
                    }
                    String key = buildMessageKey(mapping, canonical);
                    return kafkaProducerService.publishCanonicalEvent(
                            tenantId,
                            key,
                            canonical.toString(),
                            mapping.getPartnerId() != null ? mapping.getPartnerId().toString() : null,
                            mapping.getEventType())
                            .chain(() -> scheduledApiRunRepository.markCompleted(
                                    tenantId,
                                    mapping.getId(),
                                    runId,
                                    startedAt,
                                    true,
                                    canonical,
                                    null)
                                    .invoke(() -> recordScheduledRun("success")));
                })
                .onFailure().recoverWithUni(error -> {
                    LOG.warnf("Scheduled API mapping execution failed for %s: %s", mapping.getName(), error.getMessage());
                    return scheduledApiRunRepository.markCompleted(
                                    tenantId,
                                    mapping.getId(),
                                    runId,
                                    startedAt,
                                    false,
                                    null,
                                    error.getMessage())
                            .invoke(() -> recordScheduledRun("failure"))
                            .onFailure().invoke(markError ->
                                    LOG.warnf("Failed to persist scheduled API failure for %s: %s", mapping.getName(), markError.getMessage()))
                            .replaceWithVoid();
                });
    }

    private String tenantId(MappingDraft mapping) {
        return mapping.getTenantId() != null && !mapping.getTenantId().isBlank()
                ? mapping.getTenantId()
                : tenantContext.defaultTenantId();
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

    public Instant nextRunAfter(String schedule, Instant after) {
        return ScheduleExpression.nextRunAfter(schedule, after, defaultInterval);
    }

    public String scheduleDescription(String schedule) {
        return ScheduleExpression.describe(schedule, defaultInterval);
    }

    private Instant instantFrom(JsonObject value, String fieldName) {
        if (value == null) {
            return null;
        }
        String raw = value.getString(fieldName);
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(raw);
        } catch (Exception e) {
            return null;
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

    private void recordScheduledRun(String result) {
        if (meterRegistry != null) {
            meterRegistry.counter("canonbridge.scheduled.runs.completed", "result", result).increment();
        }
    }
}
