# Tasks

## Task 1: Implement UI Accessibility Features
**Status**: not_started
**Dependencies**: none

Add ARIA labels, keyboard navigation, focus states, and screen reader support to the Mapping Studio UI.

### Sub-tasks:
1. Add ARIA labels to all interactive elements (buttons, inputs, dropdowns) in mapping wizard, partner management, and DLQ screens
2. Implement keyboard navigation support with logical tab order for all core workflows
3. Add visible focus states with 3:1 contrast ratio for all focusable elements
4. Implement screen reader announcements for dynamic content updates (validation errors, preview results, save confirmations)
5. Add skip navigation links to bypass repetitive navigation
6. Ensure all form inputs have programmatically linked labels (for/id or aria-labelledby)
7. Add non-color indicators (icons/text) for all color-coded information
8. Test with keyboard-only navigation and screen reader (NVDA/JAWS/VoiceOver)

**Acceptance Criteria**:
- All interactive elements have appropriate ARIA labels
- Complete keyboard navigation works for mapping creation, field selection, transformation config, and partner onboarding
- Focus states are visible with sufficient contrast
- Screen readers announce dynamic content changes
- All forms have properly linked labels
- Skip links allow bypassing navigation
- Color information has alternative indicators

---

## Task 2: Implement Keyboard Shortcuts
**Status**: completed
**Dependencies**: Task 1

Add keyboard shortcuts for common actions in the Mapping Studio UI.

### Sub-tasks:
1. Implement Ctrl/Cmd+S for saving mapping drafts
2. Implement Ctrl/Cmd+Enter for triggering transformation tests
3. Implement Ctrl/Cmd+Z for undo mapping rule changes
4. Implement Ctrl/Cmd+Shift+Z for redo mapping rule changes
5. Create keyboard shortcuts help dialog (triggered by ? or F1)
6. Prevent default browser behavior for registered shortcuts
7. Add visual feedback (toast/animation) when shortcuts are triggered
8. Disable shortcuts when user is typing in text inputs/textareas
9. Add keyboard shortcut indicators to UI buttons (e.g., "Save (Ctrl+S)")

**Acceptance Criteria**:
- Ctrl/Cmd+S saves current mapping
- Ctrl/Cmd+Enter runs transformation test
- Ctrl/Cmd+Z/Shift+Z undo/redo work correctly
- Help dialog shows all available shortcuts
- Shortcuts don't interfere with text input
- Visual feedback confirms shortcut execution
- No conflicts with browser shortcuts

---

## Task 3: Implement API Graceful Shutdown
**Status**: not_started
**Dependencies**: none

Add graceful shutdown handling to the Mapping Studio API for clean deployments.

### Sub-tasks:
1. Add SIGTERM and SIGINT signal handlers
2. Mark readiness probe as failing when shutdown begins
3. Stop accepting new HTTP requests (return 503)
4. Pause Kafka message consumption
5. Implement configurable timeout for in-flight requests (default 30s)
6. Flush Kafka producer after request drain
7. Close database connection pools
8. Log shutdown progress and completion
9. Add configuration property for drain timeout (min 10s, max 60s)
10. Ensure total shutdown time fits within K8s terminationGracePeriodSeconds minus 5s
11. Add unit tests for shutdown sequence
12. Document shutdown behavior in API README

**Acceptance Criteria**:
- SIGTERM/SIGINT trigger graceful shutdown
- Readiness probe fails immediately on shutdown
- New requests get 503 during shutdown
- In-flight requests complete or timeout gracefully
- Kafka producer flushes pending messages
- Database connections close cleanly
- Shutdown completes within configured time
- Exit code is 0 on clean shutdown
- Interrupted request count is logged

---

## Task 4: Implement API Rate Limiting
**Status**: not_started
**Dependencies**: none

Add rate limiting to Mapping Studio API endpoints to prevent abuse.

### Sub-tasks:
1. Set up Redis for rate limit state storage
2. Implement sliding window rate limiting algorithm
3. Add rate limiting middleware for authenticated endpoints (100 req/min default)
4. Add stricter rate limiting for unauthenticated endpoints (10 req/min per IP)
5. Return HTTP 429 with Retry-After header when limit exceeded
6. Include rate limit headers in all responses (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
7. Add per-tenant rate limit overrides (rate_limit_per_minute column in partners table)
8. Implement client identifier extraction from API key or JWT subject
9. Log rate limit violations at WARN level
10. Add configuration for default rate limits
11. Add unit tests for rate limiting logic
12. Document rate limiting behavior in API documentation

**Acceptance Criteria**:
- Authenticated endpoints enforce 100 req/min per client
- Unauthenticated endpoints enforce 10 req/min per IP
- 429 responses include Retry-After header and error details
- Rate limit headers present in all responses
- Per-tenant overrides work correctly
- Sliding window prevents burst at boundaries
- Redis stores rate limit state with TTL
- Rate limit violations are logged
- Configuration allows customization

---

## Task 5: Implement Mock Latency and Failure Simulation
**Status**: not_started
**Dependencies**: none

Add latency and failure simulation capabilities to CanonBridge Mock services.

### Sub-tasks:
1. Create WireMock mapping files with fixedDelayMilliseconds examples (500ms, 2000ms, 5000ms)
2. Create WireMock mapping files with delayDistribution examples (uniform, lognormal)
3. Create WireMock mapping files with fault simulation (CONNECTION_RESET_BY_PEER, EMPTY_RESPONSE, MALFORMED_RESPONSE_CHUNK)
4. Create WireMock mapping files with HTTP error responses (500, 502, 503, 504)
5. Create WireMock mapping files with timeout simulation (10s, 30s delays)
6. Add similar latency configuration to SOAP mock endpoints
7. Create SCENARIOS.md documentation with usage examples
8. Add recommended test cases for resilience testing
9. Update docker-compose.yml to mount scenario mapping files
10. Add demo script examples using different scenarios
11. Test each scenario type to verify behavior

**Acceptance Criteria**:
- WireMock supports configurable response latency
- SOAP mock supports configurable response latency
- Random latency ranges work with uniform/lognormal distribution
- Fault responses return correct error codes and bodies
- Connection reset, empty response, and malformed response simulations work
- Example mappings demonstrate 500ms, 2s, 5s delays
- Example mappings demonstrate HTTP 500, 502, 503, 504 errors
- Example mappings demonstrate 10s and 30s timeout scenarios
- SCENARIOS.md documents all capabilities with examples
- Demo scripts can trigger different scenarios
