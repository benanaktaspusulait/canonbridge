# Rate Limiting

The Mapping Studio API implements rate limiting to prevent abuse, ensure fair resource allocation, and protect the service from being overwhelmed by excessive requests.

## Overview

Rate limiting is enforced using a **sliding window algorithm** backed by Redis. This approach prevents burst traffic at window boundaries and provides accurate rate limiting across distributed instances.

## Rate Limits

### Authenticated Requests

Authenticated requests are rate limited per client identifier (extracted from JWT subject or API key):

- **Default Limit**: 100 requests per minute
- **Identifier**: JWT subject or API key value
- **Override**: Per-tenant custom limits via database configuration

### Unauthenticated Requests

Unauthenticated requests are rate limited per IP address:

- **Default Limit**: 10 requests per minute
- **Identifier**: Client IP address (from `X-Forwarded-For` header or remote address)
- **Override**: Not supported for unauthenticated requests

### Excluded Endpoints

The following endpoints are **not rate limited**:

- `/health/*` - Health check endpoints
- `/metrics` - Prometheus metrics
- `/openapi` - OpenAPI specification
- `/swagger-ui/*` - Swagger UI

## Rate Limit Headers

All API responses include the following headers:

| Header | Description | Example |
|--------|-------------|---------|
| `X-RateLimit-Limit` | Maximum requests allowed in the window | `100` |
| `X-RateLimit-Remaining` | Requests remaining in current window | `95` |
| `X-RateLimit-Reset` | Unix timestamp (milliseconds) when limit resets | `1704067200000` |

### Example Response

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200000
Content-Type: application/json

{
  "data": "..."
}
```

## Rate Limit Exceeded

When a client exceeds their rate limit, the API returns HTTP 429 (Too Many Requests):

### Response

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067200000
Content-Type: application/json

{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Maximum 100 requests per 60 seconds allowed.",
  "limit": 100,
  "window_seconds": 60,
  "retry_after_seconds": 45
}
```

### Headers

| Header | Description |
|--------|-------------|
| `Retry-After` | Seconds to wait before retrying |
| `X-RateLimit-Limit` | Maximum requests allowed |
| `X-RateLimit-Remaining` | Always `0` when rate limited |
| `X-RateLimit-Reset` | When the limit will reset |

## Sliding Window Algorithm

The rate limiting implementation uses a **sliding window algorithm** with Redis sorted sets:

1. Each request is stored as a member in a Redis sorted set with its timestamp as the score
2. Before processing a request, entries older than the window period are removed
3. The remaining entries are counted to check if the limit is exceeded
4. If within the limit, the current request is added to the set
5. The Redis key has a TTL for automatic cleanup

### Benefits

- **No burst at boundaries**: Unlike fixed windows, sliding windows prevent clients from making 2x requests by timing requests at window boundaries
- **Accurate counting**: Counts actual requests in the last N seconds, not just the current time bucket
- **Distributed**: Works correctly across multiple API instances using shared Redis state
- **Automatic cleanup**: Redis TTL ensures old data is automatically removed

### Example

With a limit of 10 requests per 60 seconds:

```
Time:     0s    30s    60s    90s
Fixed:    [----10----][----10----]  ← Can burst 20 requests at 60s
Sliding:  [----10 requests----]     ← Always enforces 10 in any 60s window
```

## Per-Tenant Rate Limit Overrides

Premium or high-volume tenants can have custom rate limits configured in the database.

### Configuration

Update the `partners` table to set a custom rate limit:

```sql
-- Set custom rate limit for a tenant
UPDATE partners 
SET rate_limit_per_minute = 500 
WHERE tenant_id = 'premium-tenant';

-- Revert to default rate limit
UPDATE partners 
SET rate_limit_per_minute = NULL 
WHERE tenant_id = 'premium-tenant';
```

### Behavior

- If `rate_limit_per_minute` is set (non-NULL), that value is used
- If `rate_limit_per_minute` is NULL, the default limit applies
- The override applies to all authenticated requests for that tenant
- Changes take effect immediately (no cache)

## Client Implementation

### Respecting Rate Limits

Clients should:

1. **Monitor headers**: Check `X-RateLimit-Remaining` to track usage
2. **Handle 429 responses**: Implement exponential backoff or respect `Retry-After`
3. **Distribute requests**: Avoid bursts by spreading requests evenly
4. **Cache responses**: Reduce unnecessary API calls

### Example: JavaScript Client

```javascript
async function makeRequest(url, options = {}) {
  const response = await fetch(url, options);
  
  // Check rate limit headers
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  console.log(`Rate limit: ${remaining}/${limit} remaining`);
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
    
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return makeRequest(url, options);
  }
  
  return response;
}
```

### Example: Python Client

```python
import time
import requests

def make_request(url, headers=None):
    response = requests.get(url, headers=headers)
    
    # Check rate limit headers
    limit = response.headers.get('X-RateLimit-Limit')
    remaining = response.headers.get('X-RateLimit-Remaining')
    
    print(f"Rate limit: {remaining}/{limit} remaining")
    
    if response.status_code == 429:
        retry_after = int(response.headers.get('Retry-After', 60))
        print(f"Rate limited. Waiting {retry_after} seconds...")
        time.sleep(retry_after)
        return make_request(url, headers)
    
    return response
```

## Configuration

Rate limiting can be configured via environment variables:

```bash
# Enable/disable rate limiting
RATELIMIT_ENABLED=true

# Authenticated endpoint limits
RATELIMIT_AUTHENTICATED_DEFAULT_LIMIT=100
RATELIMIT_AUTHENTICATED_WINDOW_SECONDS=60

# Unauthenticated endpoint limits
RATELIMIT_UNAUTHENTICATED_DEFAULT_LIMIT=10
RATELIMIT_UNAUTHENTICATED_WINDOW_SECONDS=60

# Redis connection
REDIS_URL=redis://localhost:6379
```

### Production Recommendations

- **Authenticated limit**: 100-1000 requests/minute depending on expected usage
- **Unauthenticated limit**: 10-50 requests/minute to prevent abuse
- **Window size**: 60 seconds (1 minute) is standard
- **Redis**: Use Redis Cluster or Sentinel for high availability

## Monitoring

### Metrics

Rate limiting exposes the following metrics (via `/metrics`):

- `ratelimit_requests_total` - Total requests checked
- `ratelimit_requests_blocked_total` - Total requests blocked
- `ratelimit_requests_allowed_total` - Total requests allowed

### Logs

Rate limit violations are logged at WARN level:

```
WARN Rate limit exceeded for client premium-api-key: 101/100 requests in 60s window
```

### Alerts

Consider setting up alerts for:

- High rate limit violation rate (may indicate abuse or misconfigured client)
- Redis connection failures (rate limiting will fail open)
- Unusual traffic patterns per client

## Troubleshooting

### Rate Limit Too Restrictive

**Symptom**: Legitimate clients are being rate limited

**Solutions**:
1. Increase the default limit via environment variables
2. Configure per-tenant overrides for high-volume clients
3. Ensure clients are properly authenticated (authenticated limits are higher)
4. Check if clients are properly caching responses

### Rate Limiting Not Working

**Symptom**: Clients can exceed configured limits

**Solutions**:
1. Verify `RATELIMIT_ENABLED=true`
2. Check Redis connectivity
3. Verify Redis is not full (check memory usage)
4. Check logs for Redis errors

### Redis Connection Issues

**Symptom**: Errors in logs about Redis connection failures

**Behavior**: Rate limiting fails open (allows all requests) to avoid blocking legitimate traffic

**Solutions**:
1. Verify Redis is running and accessible
2. Check `REDIS_URL` configuration
3. Verify network connectivity between API and Redis
4. Check Redis logs for errors

## Security Considerations

### DDoS Protection

Rate limiting provides basic DDoS protection but should be combined with:

- **WAF (Web Application Firewall)**: For layer 7 protection
- **Network-level rate limiting**: At load balancer or ingress
- **IP blocking**: For known malicious IPs
- **CAPTCHA**: For suspicious traffic patterns

### IP Spoofing

The API uses `X-Forwarded-For` for unauthenticated requests. Ensure:

- Load balancer or reverse proxy sets this header correctly
- Untrusted clients cannot set this header directly
- Consider using the rightmost trusted IP in the chain

### Fail-Open Behavior

On Redis errors, rate limiting **fails open** (allows requests) to avoid blocking legitimate traffic. This means:

- Redis outages won't cause API downtime
- But rate limiting protection is temporarily disabled
- Monitor Redis health closely

## See Also

- [API README](../README.md)
- [Security Documentation](../../../docs/implementation/10-security.md)
- [Architecture Overview](../../../docs/architecture/01-overview.md)
