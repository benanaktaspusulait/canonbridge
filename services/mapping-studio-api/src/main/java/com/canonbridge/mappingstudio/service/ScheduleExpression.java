package com.canonbridge.mappingstudio.service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

final class ScheduleExpression {

    private static final int MAX_SCAN_MINUTES = 366 * 24 * 60;

    private ScheduleExpression() {
    }

    static Instant nextRunAfter(String schedule, Instant after, String fallbackInterval) {
        Instant anchor = after != null ? after : Instant.now();
        String raw = schedule != null ? schedule.trim() : "";
        if (raw.isBlank()) {
            return anchor.plus(fallbackInterval(fallbackInterval));
        }

        Duration interval = parseDuration(raw, fallbackInterval);
        if (interval != null) {
            return anchor.plus(interval);
        }

        CronSpec cron = CronSpec.parse(raw);
        if (cron != null) {
            return cron.nextAfter(anchor);
        }

        return anchor.plus(fallbackInterval(fallbackInterval));
    }

    static boolean isDue(JsonLikeRunState runState, Instant now) {
        if (runState == null || runState.nextRunAt() == null) {
            return true;
        }
        return !runState.nextRunAt().isAfter(now != null ? now : Instant.now());
    }

    static String describe(String schedule, String fallbackInterval) {
        String raw = schedule != null ? schedule.trim() : "";
        if (raw.isBlank()) {
            return "fallback interval " + fallbackInterval(fallbackInterval);
        }
        Duration interval = parseDuration(raw, fallbackInterval);
        if (interval != null) {
            return "fixed interval " + interval;
        }
        CronSpec cron = CronSpec.parse(raw);
        if (cron != null) {
            return cron.hasSecondsField ? "cron expression with seconds field" : "cron expression";
        }
        return "fallback interval " + fallbackInterval(fallbackInterval);
    }

    interface JsonLikeRunState {
        Instant nextRunAt();
    }

    private static Duration parseDuration(String schedule, String fallbackInterval) {
        try {
            if (schedule.toUpperCase(Locale.ROOT).startsWith("P")) {
                return positive(Duration.parse(schedule));
            }
        } catch (Exception ignored) {
        }

        String lower = schedule.toLowerCase(Locale.ROOT);
        if (lower.matches("\\d+[smhd]")) {
            long amount = Long.parseLong(lower.substring(0, lower.length() - 1));
            return switch (lower.charAt(lower.length() - 1)) {
                case 's' -> positive(Duration.ofSeconds(amount));
                case 'm' -> positive(Duration.ofMinutes(amount));
                case 'h' -> positive(Duration.ofHours(amount));
                case 'd' -> positive(Duration.ofDays(amount));
                default -> fallbackInterval(fallbackInterval);
            };
        }
        if ("@hourly".equals(lower) || "hourly".equals(lower)) {
            return Duration.ofHours(1);
        }
        if ("@daily".equals(lower) || "daily".equals(lower)) {
            return Duration.ofDays(1);
        }
        if ("@weekly".equals(lower) || "weekly".equals(lower)) {
            return Duration.ofDays(7);
        }
        return null;
    }

    private static Duration fallbackInterval(String fallbackInterval) {
        try {
            return positive(Duration.parse(fallbackInterval));
        } catch (Exception ignored) {
            return Duration.ofMinutes(15);
        }
    }

    private static Duration positive(Duration duration) {
        return duration != null && !duration.isNegative() && !duration.isZero()
                ? duration
                : Duration.ofMinutes(15);
    }

    private static final class CronSpec {
        private final CronField seconds;
        private final CronField minutes;
        private final CronField hours;
        private final CronField daysOfMonth;
        private final CronField months;
        private final CronField daysOfWeek;
        private final boolean hasSecondsField;

        private CronSpec(
                CronField seconds,
                CronField minutes,
                CronField hours,
                CronField daysOfMonth,
                CronField months,
                CronField daysOfWeek,
                boolean hasSecondsField) {
            this.seconds = seconds;
            this.minutes = minutes;
            this.hours = hours;
            this.daysOfMonth = daysOfMonth;
            this.months = months;
            this.daysOfWeek = daysOfWeek;
            this.hasSecondsField = hasSecondsField;
        }

        static CronSpec parse(String raw) {
            String normalized = raw.trim().replaceAll("\\s+", " ");
            String[] parts = normalized.split(" ");
            if (parts.length != 5 && parts.length != 6) {
                return null;
            }

            try {
                boolean hasSeconds = parts.length == 6;
                int offset = hasSeconds ? 1 : 0;
                CronField seconds = hasSeconds
                        ? CronField.parse(parts[0], 0, 59, ValueAliases.none())
                        : CronField.only(0, 0, 59);
                CronField minutes = CronField.parse(parts[offset], 0, 59, ValueAliases.none());
                CronField hours = CronField.parse(parts[offset + 1], 0, 23, ValueAliases.none());
                CronField daysOfMonth = CronField.parse(parts[offset + 2], 1, 31, ValueAliases.none());
                CronField months = CronField.parse(parts[offset + 3], 1, 12, ValueAliases.months());
                CronField daysOfWeek = CronField.parse(parts[offset + 4], 0, 7, ValueAliases.daysOfWeek());
                return new CronSpec(seconds, minutes, hours, daysOfMonth, months, daysOfWeek, hasSeconds);
            } catch (Exception ignored) {
                return null;
            }
        }

        Instant nextAfter(Instant after) {
            ZonedDateTime cursor = ZonedDateTime.ofInstant(after, ZoneOffset.UTC)
                    .plusSeconds(1)
                    .truncatedTo(ChronoUnit.SECONDS);
            int firstSecond = seconds.first();
            if (cursor.getSecond() > firstSecond) {
                cursor = cursor.plusMinutes(1).withSecond(firstSecond);
            } else {
                cursor = cursor.withSecond(firstSecond);
            }

            for (int i = 0; i < MAX_SCAN_MINUTES; i++) {
                if (matches(cursor)) {
                    return cursor.toInstant();
                }
                cursor = cursor.plusMinutes(1).withSecond(firstSecond);
            }

            throw new IllegalArgumentException("Unable to resolve next cron run within one year");
        }

        private boolean matches(ZonedDateTime value) {
            return seconds.matches(value.getSecond())
                    && minutes.matches(value.getMinute())
                    && hours.matches(value.getHour())
                    && months.matches(value.getMonthValue())
                    && dayMatches(value);
        }

        private boolean dayMatches(ZonedDateTime value) {
            boolean domWildcard = daysOfMonth.wildcard;
            boolean dowWildcard = daysOfWeek.wildcard;
            boolean domMatches = daysOfMonth.matches(value.getDayOfMonth());
            boolean dowMatches = daysOfWeek.matches(cronDayOfWeek(value.getDayOfWeek()));

            if (!domWildcard && !dowWildcard) {
                return domMatches || dowMatches;
            }
            return domMatches && dowMatches;
        }

        private int cronDayOfWeek(DayOfWeek dayOfWeek) {
            return dayOfWeek == DayOfWeek.SUNDAY ? 0 : dayOfWeek.getValue();
        }
    }

    private record ValueAliases(java.util.Map<String, Integer> values) {
        static ValueAliases none() {
            return new ValueAliases(java.util.Map.of());
        }

        static ValueAliases months() {
            return new ValueAliases(java.util.Map.ofEntries(
                    java.util.Map.entry("JAN", 1),
                    java.util.Map.entry("FEB", 2),
                    java.util.Map.entry("MAR", 3),
                    java.util.Map.entry("APR", 4),
                    java.util.Map.entry("MAY", 5),
                    java.util.Map.entry("JUN", 6),
                    java.util.Map.entry("JUL", 7),
                    java.util.Map.entry("AUG", 8),
                    java.util.Map.entry("SEP", 9),
                    java.util.Map.entry("OCT", 10),
                    java.util.Map.entry("NOV", 11),
                    java.util.Map.entry("DEC", 12)
            ));
        }

        static ValueAliases daysOfWeek() {
            return new ValueAliases(java.util.Map.ofEntries(
                    java.util.Map.entry("SUN", 0),
                    java.util.Map.entry("MON", 1),
                    java.util.Map.entry("TUE", 2),
                    java.util.Map.entry("WED", 3),
                    java.util.Map.entry("THU", 4),
                    java.util.Map.entry("FRI", 5),
                    java.util.Map.entry("SAT", 6)
            ));
        }
    }

    private static final class CronField {
        private final Set<Integer> allowed;
        private final boolean wildcard;

        private CronField(Set<Integer> allowed, boolean wildcard) {
            this.allowed = allowed;
            this.wildcard = wildcard;
        }

        static CronField only(int value, int min, int max) {
            if (value < min || value > max) {
                throw new IllegalArgumentException("Cron field outside range");
            }
            return new CronField(Set.of(value), false);
        }

        static CronField parse(String raw, int min, int max, ValueAliases aliases) {
            String expression = raw.trim().toUpperCase(Locale.ROOT);
            if ("*".equals(expression) || "?".equals(expression)) {
                return range(min, max, true);
            }

            Set<Integer> allowed = new HashSet<>();
            for (String part : expression.split(",")) {
                addPart(allowed, part.trim(), min, max, aliases);
            }
            if (allowed.isEmpty()) {
                throw new IllegalArgumentException("Empty cron field");
            }
            return new CronField(Set.copyOf(allowed), false);
        }

        boolean matches(int value) {
            return allowed.contains(value) || value == 7 && allowed.contains(0);
        }

        int first() {
            return allowed.stream().mapToInt(Integer::intValue).min().orElse(0);
        }

        private static CronField range(int min, int max, boolean wildcard) {
            Set<Integer> values = new HashSet<>();
            for (int i = min; i <= max; i++) {
                values.add(i);
            }
            return new CronField(Set.copyOf(values), wildcard);
        }

        private static void addPart(Set<Integer> allowed, String part, int min, int max, ValueAliases aliases) {
            if (part.isBlank()) {
                return;
            }

            String base = part;
            int step = 1;
            int slash = part.indexOf('/');
            if (slash >= 0) {
                base = part.substring(0, slash);
                step = Integer.parseInt(part.substring(slash + 1));
                if (step <= 0) {
                    throw new IllegalArgumentException("Cron step must be positive");
                }
            }

            int start;
            int end;
            if ("*".equals(base) || "?".equals(base) || base.isBlank()) {
                start = min;
                end = max;
            } else if (base.contains("-")) {
                String[] range = base.split("-", 2);
                start = parseValue(range[0], aliases);
                end = parseValue(range[1], aliases);
            } else {
                start = parseValue(base, aliases);
                end = slash >= 0 ? max : start;
            }

            if (start < min || end > max || start > end) {
                throw new IllegalArgumentException("Cron field outside range");
            }
            for (int i = start; i <= end; i += step) {
                allowed.add(i);
            }
        }

        private static int parseValue(String raw, ValueAliases aliases) {
            Integer alias = aliases.values().get(raw.toUpperCase(Locale.ROOT));
            return alias != null ? alias : Integer.parseInt(raw);
        }
    }
}
