package com.canonbridge.mappingstudio.service;

import com.canonbridge.mappingstudio.kafka.KafkaProducerService;
import com.canonbridge.mappingstudio.repository.OutboxEventRepository;
import com.canonbridge.mappingstudio.repository.OutboxEventRepository.OutboxEvent;
import io.micrometer.core.instrument.MeterRegistry;
import io.smallrye.mutiny.Uni;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@ApplicationScoped
public class OutboxReplayService {

    private static final Logger LOG = Logger.getLogger(OutboxReplayService.class);

    @Inject
    OutboxEventRepository outboxEventRepository;

    @Inject
    KafkaProducerService kafkaProducerService;

    @Inject
    MeterRegistry meterRegistry;

    @Inject
    LeaderLockService leaderLockService;

    @ConfigProperty(name = "canonbridge.outbox.replay.enabled", defaultValue = "true")
    boolean enabled;

    @ConfigProperty(name = "canonbridge.outbox.replay.tick-seconds", defaultValue = "30")
    long tickSeconds;

    @ConfigProperty(name = "canonbridge.outbox.replay.batch-size", defaultValue = "50")
    int batchSize;

    @ConfigProperty(name = "canonbridge.outbox.replay.max-attempts", defaultValue = "10")
    int maxAttempts;

    private final AtomicBoolean running = new AtomicBoolean(false);
    private ScheduledExecutorService executor;

    @PostConstruct
    void start() {
        if (!enabled) {
            LOG.info("Outbox replay worker disabled");
            return;
        }
        executor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread thread = new Thread(r, "outbox-replay-worker");
            thread.setDaemon(true);
            return thread;
        });
        long delaySeconds = Math.max(5, tickSeconds);
        executor.scheduleWithFixedDelay(this::replaySafely, delaySeconds, delaySeconds, TimeUnit.SECONDS);
        LOG.infof("Outbox replay worker started with %d second tick", delaySeconds);
    }

    @PreDestroy
    void stop() {
        if (executor != null) {
            executor.shutdownNow();
        }
    }

    void replaySafely() {
        replayDueEvents()
                .subscribe().with(
                        ignored -> {},
                        error -> LOG.warnf("Outbox replay worker failed: %s", error.getMessage()));
    }

    public Uni<Integer> replayDueEvents() {
        if (!running.compareAndSet(false, true)) {
            return Uni.createFrom().item(0);
        }

        LeaderLockService lockService = leaderLockService != null ? leaderLockService : new LeaderLockService();
        return lockService.withLock("canonbridge.outbox-replay", this::replayDueEventsUnlocked, 0)
                .eventually(() -> {
                    running.set(false);
                    return Uni.createFrom().voidItem();
                });
    }

    private Uni<Integer> replayDueEventsUnlocked() {
        return outboxEventRepository.findReplayable(batchSize, maxAttempts)
                .chain(events -> {
                    if (events.isEmpty()) {
                        return Uni.createFrom().item(0);
                    }
                    List<Uni<Void>> jobs = new ArrayList<>();
                    for (OutboxEvent event : events) {
                        jobs.add(kafkaProducerService.replayOutboxEvent(event)
                                .onFailure().recoverWithNull());
                    }
                    return Uni.combine().all().unis(jobs)
                            .discardItems()
                            .replaceWith(events.size());
                })
                .invoke(count -> {
                    if (count > 0) {
                        if (meterRegistry != null) {
                            meterRegistry.counter("canonbridge.outbox.replay.batch.events").increment(count);
                        }
                        LOG.infof("Replayed %d outbox event(s)", count);
                    }
                });
    }
}
