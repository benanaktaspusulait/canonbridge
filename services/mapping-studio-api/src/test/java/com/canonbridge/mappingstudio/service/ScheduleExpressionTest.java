package com.canonbridge.mappingstudio.service;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ScheduleExpressionTest {

    @Test
    void resolvesIsoDurationSchedules() {
        Instant anchor = Instant.parse("2026-05-20T09:00:00Z");

        Instant nextRun = ScheduleExpression.nextRunAfter("PT15M", anchor, "PT1H");

        assertEquals(Instant.parse("2026-05-20T09:15:00Z"), nextRun);
    }

    @Test
    void resolvesShortIntervalSchedules() {
        Instant anchor = Instant.parse("2026-05-20T09:00:00Z");

        Instant nextRun = ScheduleExpression.nextRunAfter("2h", anchor, "PT15M");

        assertEquals(Instant.parse("2026-05-20T11:00:00Z"), nextRun);
    }

    @Test
    void resolvesFiveFieldCronSchedules() {
        Instant anchor = Instant.parse("2026-05-20T09:07:33Z");

        Instant nextRun = ScheduleExpression.nextRunAfter("*/15 * * * *", anchor, "PT1H");

        assertEquals(Instant.parse("2026-05-20T09:15:00Z"), nextRun);
    }

    @Test
    void resolvesSixFieldCronSchedulesWithQuestionMark() {
        Instant anchor = Instant.parse("2026-05-20T09:15:00Z");

        Instant nextRun = ScheduleExpression.nextRunAfter("0 */15 * * * ?", anchor, "PT1H");

        assertEquals(Instant.parse("2026-05-20T09:30:00Z"), nextRun);
    }

    @Test
    void fallsBackWhenScheduleIsBlank() {
        Instant anchor = Instant.parse("2026-05-20T09:00:00Z");

        Instant nextRun = ScheduleExpression.nextRunAfter("", anchor, "PT30M");

        assertEquals(Instant.parse("2026-05-20T09:30:00Z"), nextRun);
    }

    @Test
    void describesCronContract() {
        String description = ScheduleExpression.describe("0 */10 * * * ?", "PT15M");

        assertTrue(description.contains("cron"));
    }
}
