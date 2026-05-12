# WireMock Migration Plan

## Current State

The `canonbridge-mock` currently uses a mix of:
- Custom Spring Boot services for REST/SOAP mocking
- Kafka for event streaming
- Webhook receiver service

## WireMock Benefits

### Advantages
1. **No Code Required**: JSON-based configuration
2. **Rich Features**: 
   - Request matching (URL, headers, body)
   - Response templating
   - Fault injection
   - Delay simulation
   - Stateful behavior
3. **Easy Maintenance**: No compilation needed
4. **Industry Standard**: Well-documented and widely used

### Disadvantages
1. **Learning Curve**: New configuration format
2. **Migration Effort**: Need to convert existing mocks
3. **Limited Business Logic**: Complex scenarios harder to implement

## Migration Strategy

### Phase 1: Evaluation (1 week)
- [ ] Set up WireMock standalone in docker-compose
- [ ] Migrate 2-3 simple REST endpoints
- [ ] Test delay and fault injection
- [ ] Compare with current implementation

### Phase 2: REST Migration (2 weeks)
- [ ] Migrate PayFlex REST endpoints
- [ ] Migrate ShopMax REST endpoints
- [ ] Add response templating
- [ ] Configure delays and faults

### Phase 3: SOAP Migration (2 weeks)
- [ ] Migrate FastCargo SOAP endpoints
- [ ] Configure SOAP envelope handling
- [ ] Test with existing clients

### Phase 4: Advanced Features (1 week)
- [ ] Implement stateful scenarios
- [ ] Add request verification
- [ ] Configure response scenarios
- [ ] Performance testing

## WireMock Configuration Example

### REST Endpoint

```json
{
  "request": {
    "method": "GET",
    "urlPathPattern": "/api/orders/([0-9]+)"
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonBody": {
      "orderId": "{{request.pathSegments.[2]}}",
      "status": "CONFIRMED",
      "total": 250.50
    },
    "fixedDelayMilliseconds": 100
  }
}
```

### SOAP Endpoint

```json
{
  "request": {
    "method": "POST",
    "urlPath": "/soap/tracking",
    "bodyPatterns": [
      {
        "matchesXPath": "//TrackingNumber[text()='TRK-12345']"
      }
    ]
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "text/xml"
    },
    "body": "<?xml version=\"1.0\"?><soap:Envelope>...</soap:Envelope>",
    "fixedDelayMilliseconds": 500
  }
}
```

### Fault Injection

```json
{
  "request": {
    "method": "GET",
    "urlPath": "/api/flaky-endpoint"
  },
  "response": {
    "fault": "CONNECTION_RESET_BY_PEER"
  }
}
```

## Docker Compose Integration

```yaml
wiremock:
  image: wiremock/wiremock:3.5.2
  container_name: canonbridge-wiremock
  ports:
    - "8080:8080"
  volumes:
    - ./wiremock/mappings:/home/wiremock/mappings
    - ./wiremock/__files:/home/wiremock/__files
  command:
    - --global-response-templating
    - --verbose
```

## Decision Criteria

### Migrate to WireMock if:
- ✅ Mock endpoints are relatively simple
- ✅ Need easy configuration changes
- ✅ Want to simulate network issues
- ✅ Need stateful behavior
- ✅ Team prefers declarative configuration

### Keep Current Implementation if:
- ❌ Complex business logic in mocks
- ❌ Need custom authentication flows
- ❌ Require database integration
- ❌ Heavy data transformation needed
- ❌ Team prefers code-based approach

## Recommendation

**Hybrid Approach:**
1. Use WireMock for simple REST/SOAP endpoints
2. Keep custom services for complex scenarios
3. Use WireMock for fault injection and delays
4. Maintain current Kafka infrastructure

This provides flexibility while leveraging WireMock's strengths.

## Next Steps

1. Review this plan with the team
2. Set up WireMock in a separate branch
3. Migrate 2-3 endpoints as POC
4. Evaluate and decide on full migration
5. Update documentation accordingly

## Resources

- [WireMock Documentation](https://wiremock.org/docs/)
- [WireMock Docker Hub](https://hub.docker.com/r/wiremock/wiremock)
- [Request Matching](https://wiremock.org/docs/request-matching/)
- [Response Templating](https://wiremock.org/docs/response-templating/)
- [Simulating Faults](https://wiremock.org/docs/simulating-faults/)
