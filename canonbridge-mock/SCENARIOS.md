# CanonBridge Mock - Latency and Failure Simulation Scenarios

## Overview

The CanonBridge Mock services provide comprehensive latency and failure simulation capabilities for testing resilience, error handling, and timeout behavior in the integration layer.

## WireMock Scenarios

All scenarios are implemented as WireMock mapping files in the `wiremock/mappings/` directory.

### Latency Simulation

#### Fixed Delay Scenarios

| Endpoint | Delay | Use Case |
|----------|-------|----------|
| `/api/orders/slow-500ms` | 500ms | Normal slow response |
| `/api/orders/slow-2s` | 2000ms | Degraded performance |
| `/api/orders/slow-5s` | 5000ms | Severe performance degradation |

**Example Request:**
```bash
curl http://localhost:8080/api/orders/slow-500ms
```

**Example Response:**
```json
{
  "orders": [
    {
      "id": "ORD-5521",
      "customer": {
        "name": "Ayşe Yılmaz",
        "status": "ACTIVE"
      },
      "placedAt": "2026-05-10T09:15:00Z",
      "quantity": 4,
      "shippingQuote": {
        "serviceLevel": "EXPRESS",
        "etaDays": 2,
        "price": 12.5
      }
    }
  ],
  "nextUpdatedSince": "2026-05-10T09:16:00Z",
  "simulatedLatency": "500ms"
}
```

#### Random Delay Scenarios

| Endpoint | Distribution | Parameters | Use Case |
|----------|--------------|------------|----------|
| `/api/orders/random-latency` | Uniform | 100-1000ms | Variable latency testing |
| `/api/orders/realistic-latency` | Lognormal | median=200ms, σ=0.4 | Realistic production-like latency |

**Uniform Distribution:**
- Produces random delays evenly distributed between 100ms and 1000ms
- Good for testing variable latency handling

**Lognormal Distribution:**
- Produces delays with a median of 200ms and occasional spikes
- Mimics real-world network latency patterns
- Most requests are fast, but some are significantly slower

**Example Request:**
```bash
curl http://localhost:8080/api/orders/random-latency
```

### Fault Simulation

#### Connection Faults

| Endpoint | Fault Type | Behavior |
|----------|------------|----------|
| `/api/orders/connection-reset` | CONNECTION_RESET_BY_PEER | TCP connection reset |
| `/api/orders/empty-response` | EMPTY_RESPONSE | Connection closes with no data |
| `/api/orders/malformed-response` | MALFORMED_RESPONSE_CHUNK | Invalid HTTP response |

**Example Request:**
```bash
# This will cause a connection reset
curl http://localhost:8080/api/orders/connection-reset
# Expected: curl: (56) Recv failure: Connection reset by peer
```

**Use Cases:**
- Test connection retry logic
- Verify circuit breaker behavior
- Validate error logging and alerting

### HTTP Error Responses

| Endpoint | Status | Error Type | Use Case |
|----------|--------|------------|----------|
| `/api/orders/error-500` | 500 | Internal Server Error | Upstream service failure |
| `/api/orders/error-502` | 502 | Bad Gateway | Proxy/gateway error |
| `/api/orders/error-503` | 503 | Service Unavailable | Temporary unavailability |
| `/api/orders/error-504` | 504 | Gateway Timeout | Upstream timeout |

**Example Request:**
```bash
curl http://localhost:8080/api/orders/error-500
```

**Example Response:**
```json
{
  "error": "internal_server_error",
  "message": "An unexpected error occurred while processing your request",
  "timestamp": "2026-05-10T14:00:00Z",
  "path": "/api/orders/error-500"
}
```

**Use Cases:**
- Test error handling and retry logic
- Verify DLQ (Dead Letter Queue) behavior
- Validate error message propagation
- Test circuit breaker thresholds

### Timeout Simulation

| Endpoint | Delay | Use Case |
|----------|-------|----------|
| `/api/orders/timeout-10s` | 10000ms | Standard timeout threshold |
| `/api/orders/timeout-30s` | 30000ms | Extended timeout threshold |

**Example Request:**
```bash
# This will take 10 seconds to respond
curl --max-time 5 http://localhost:8080/api/orders/timeout-10s
# Expected: curl: (28) Operation timed out after 5001 milliseconds
```

**Use Cases:**
- Test client timeout configuration
- Verify timeout error handling
- Validate async processing behavior
- Test request cancellation

## SOAP Mock Scenarios

The SOAP mock service supports similar latency configuration through environment variables or configuration files.

### Configuration

Add latency to SOAP responses by setting environment variables:

```yaml
# docker-compose.yml
soap-mock:
  environment:
    - SOAP_RESPONSE_DELAY_MS=500
    - SOAP_ERROR_RATE=0.1  # 10% error rate
```

### Supported Scenarios

- **Fixed Delay**: Set `SOAP_RESPONSE_DELAY_MS` to add consistent latency
- **Random Delay**: Set `SOAP_RESPONSE_DELAY_MIN_MS` and `SOAP_RESPONSE_DELAY_MAX_MS`
- **Error Simulation**: Set `SOAP_ERROR_RATE` (0.0 to 1.0) for random SOAP faults

## Docker Compose Integration

The `docker-compose.yml` file is configured to mount the WireMock mappings directory:

```yaml
services:
  wiremock:
    image: wiremock/wiremock:latest
    ports:
      - "8080:8080"
    volumes:
      - ./wiremock/mappings:/home/wiremock/mappings
    command:
      - --global-response-templating
      - --verbose
```

## Testing Recommendations

### Resilience Testing

1. **Retry Logic**:
   ```bash
   # Test with 500ms delay
   for i in {1..5}; do
     time curl http://localhost:8080/api/orders/slow-500ms
   done
   ```

2. **Circuit Breaker**:
   ```bash
   # Trigger circuit breaker with errors
   for i in {1..20}; do
     curl http://localhost:8080/api/orders/error-500
   done
   ```

3. **Timeout Handling**:
   ```bash
   # Test timeout with 5s client timeout
   curl --max-time 5 http://localhost:8080/api/orders/timeout-10s
   ```

### Load Testing

Use tools like Apache Bench or k6 to test under load:

```bash
# Test with 100 concurrent requests
ab -n 1000 -c 100 http://localhost:8080/api/orders/slow-500ms

# Test with k6
k6 run --vus 50 --duration 30s load-test.js
```

### Chaos Engineering

Combine scenarios for chaos testing:

```bash
# Random scenario selector
SCENARIOS=(
  "slow-500ms"
  "slow-2s"
  "error-500"
  "error-503"
  "connection-reset"
)

for i in {1..100}; do
  SCENARIO=${SCENARIOS[$RANDOM % ${#SCENARIOS[@]}]}
  curl http://localhost:8080/api/orders/$SCENARIO
  sleep 0.1
done
```

## Monitoring and Observability

### Metrics to Track

When testing with these scenarios, monitor:

- **Latency Percentiles**: p50, p95, p99
- **Error Rates**: 4xx, 5xx responses
- **Timeout Rates**: Requests exceeding timeout threshold
- **Retry Counts**: Number of retries per request
- **Circuit Breaker State**: Open, half-open, closed
- **DLQ Messages**: Failed messages sent to dead letter queue

### Logging

Enable verbose logging to see scenario execution:

```bash
# WireMock verbose mode
docker-compose up wiremock --verbose

# Check logs
docker-compose logs -f wiremock
```

## Recommended Test Cases

### Test Case 1: Normal Latency Tolerance

**Objective**: Verify system handles normal slow responses

**Steps**:
1. Send requests to `/api/orders/slow-500ms`
2. Verify all requests succeed
3. Check latency metrics are within acceptable range

**Expected**: All requests succeed, p99 < 1s

### Test Case 2: Degraded Performance

**Objective**: Verify system handles degraded upstream performance

**Steps**:
1. Send requests to `/api/orders/slow-2s`
2. Verify requests succeed but with increased latency
3. Check for timeout warnings but no failures

**Expected**: All requests succeed, p99 < 3s, warnings logged

### Test Case 3: Severe Degradation

**Objective**: Verify system handles severe performance issues

**Steps**:
1. Send requests to `/api/orders/slow-5s`
2. Verify some requests may timeout
3. Check circuit breaker opens after threshold

**Expected**: Some timeouts, circuit breaker opens, DLQ messages created

### Test Case 4: Connection Failures

**Objective**: Verify system handles connection failures

**Steps**:
1. Send requests to `/api/orders/connection-reset`
2. Verify retry logic activates
3. Check error logging and alerting

**Expected**: Retries attempted, errors logged, alerts triggered

### Test Case 5: HTTP Error Handling

**Objective**: Verify system handles HTTP errors correctly

**Steps**:
1. Send requests to `/api/orders/error-500`
2. Verify error responses are handled
3. Check DLQ for failed messages

**Expected**: Errors handled gracefully, messages in DLQ, no crashes

### Test Case 6: Timeout Behavior

**Objective**: Verify timeout configuration is correct

**Steps**:
1. Send requests to `/api/orders/timeout-10s` with 5s timeout
2. Verify requests timeout as expected
3. Check timeout errors are logged

**Expected**: Requests timeout after 5s, timeout errors logged

### Test Case 7: Variable Latency

**Objective**: Verify system handles variable latency

**Steps**:
1. Send 100 requests to `/api/orders/random-latency`
2. Verify all requests succeed
3. Check latency distribution

**Expected**: All succeed, latency varies 100-1000ms, no timeouts

### Test Case 8: Realistic Production Patterns

**Objective**: Verify system handles realistic latency patterns

**Steps**:
1. Send 1000 requests to `/api/orders/realistic-latency`
2. Verify most requests are fast
3. Check occasional slow requests are handled

**Expected**: p50 ~200ms, p99 < 1s, all requests succeed

## Troubleshooting

### WireMock Not Responding

```bash
# Check if WireMock is running
docker-compose ps wiremock

# Check WireMock logs
docker-compose logs wiremock

# Restart WireMock
docker-compose restart wiremock
```

### Mappings Not Loading

```bash
# Verify mappings directory is mounted
docker-compose exec wiremock ls -la /home/wiremock/mappings

# Reload mappings
curl -X POST http://localhost:8080/__admin/mappings/reset
```

### Unexpected Behavior

```bash
# Check WireMock admin API
curl http://localhost:8080/__admin/mappings

# View request journal
curl http://localhost:8080/__admin/requests
```

## Advanced Scenarios

### Scenario Chaining

Create complex scenarios by chaining multiple behaviors:

```json
{
  "scenarioName": "flaky-service",
  "requiredScenarioState": "Started",
  "newScenarioState": "Error",
  "request": {
    "method": "GET",
    "urlPath": "/api/orders/flaky"
  },
  "response": {
    "status": 200,
    "fixedDelayMilliseconds": 500
  }
}
```

### Probability-Based Responses

Use response templating for random behavior:

```json
{
  "response": {
    "status": "{{randomValue type='RANDOM' values='200,500,503'}}",
    "transformers": ["response-template"]
  }
}
```

## Resources

- [WireMock Documentation](https://wiremock.org/docs/)
- [WireMock Fault Simulation](https://wiremock.org/docs/simulating-faults/)
- [WireMock Response Templating](https://wiremock.org/docs/response-templating/)
- [Chaos Engineering Principles](https://principlesofchaos.org/)

## Contact

For questions or issues with mock scenarios:
- Email: support@canonbridge.example
- Issue Tracker: GitHub Issues
- Documentation: See this file

## Changelog

### Version 1.0.0 - P3 Hardening (Current)

**Added**:
- Fixed delay scenarios (500ms, 2s, 5s)
- Random delay scenarios (uniform, lognormal)
- Connection fault scenarios (reset, empty, malformed)
- HTTP error scenarios (500, 502, 503, 504)
- Timeout scenarios (10s, 30s)
- Comprehensive documentation with test cases
- Docker Compose integration
- Troubleshooting guide

---

**Implementation Date**: 2024
**Implemented By**: Kiro AI Assistant
**Specification**: P3 Hardening Features - Task 5
