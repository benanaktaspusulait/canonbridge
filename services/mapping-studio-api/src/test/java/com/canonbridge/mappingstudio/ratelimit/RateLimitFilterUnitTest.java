package com.canonbridge.mappingstudio.ratelimit;

import io.smallrye.mutiny.Uni;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.net.SocketAddress;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.core.MultivaluedHashMap;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.UriInfo;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.security.Principal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RateLimitFilterUnitTest {

    @Test
    void authLoginRequestsAreRateLimited() {
        Fixture fixture = fixture("api/auth/login");

        Response result = fixture.filter.filter(fixture.requestContext).await().indefinitely();

        verify(fixture.rateLimitService).checkRateLimit("ip:127.0.0.1", 10, 60);
        assertNull(result);
    }

    @Test
    void proxyRequestsAreRateLimitedForAuthenticatedClients() {
        Fixture fixture = fixture("api/proxy/partners/acme");
        SecurityContext securityContext = mock(SecurityContext.class);
        Principal principal = () -> "jwt:user-123";
        when(securityContext.getUserPrincipal()).thenReturn(principal);
        when(fixture.requestContext.getSecurityContext()).thenReturn(securityContext);

        fixture.filter.filter(fixture.requestContext).await().indefinitely();

        verify(fixture.rateLimitService).checkRateLimit("jwt:user-123", 100, 60);
    }

    @Test
    void healthRequestsAreNotRateLimited() {
        Fixture fixture = fixture("health/live");

        Response result = fixture.filter.filter(fixture.requestContext).await().indefinitely();

        verify(fixture.rateLimitService, never()).checkRateLimit(anyString(), anyInt(), anyInt());
        assertNull(result);
    }

    @Test
    void presentedApiKeyIsFingerprintedForUnauthenticatedClientId() {
        Fixture fixture = fixture("api/auth/login");
        when(fixture.requestContext.getHeaderString("X-API-Key")).thenReturn("plain-secret-key");

        fixture.filter.filter(fixture.requestContext).await().indefinitely();

        ArgumentCaptor<String> clientId = ArgumentCaptor.forClass(String.class);
        verify(fixture.rateLimitService).checkRateLimit(clientId.capture(), anyInt(), anyInt());
        assertTrue(clientId.getValue().startsWith("api-key:"));
        assertFalse(clientId.getValue().contains("plain-secret-key"));
    }

    @Test
    void deniedRequestReturns429WithRateLimitHeaders() {
        Fixture fixture = fixture("api/auth/login", new RateLimitResult(false, 10, 0, 123456L, 42L));

        Response result = fixture.filter.filter(fixture.requestContext).await().indefinitely();

        assertNotNull(result);
        assertEquals(429, result.getStatus());
        assertEquals("42", result.getHeaderString("Retry-After"));
        assertEquals("10", result.getHeaderString("X-RateLimit-Limit"));
        assertEquals("0", result.getHeaderString("X-RateLimit-Remaining"));
    }

    @Test
    void successfulRequestsReceiveRateLimitResponseHeaders() {
        Fixture fixture = fixture("api/auth/login", new RateLimitResult(true, 10, 8, 123456L, 0L));
        ContainerResponseContext responseContext = mock(ContainerResponseContext.class);
        MultivaluedHashMap<String, Object> headers = new MultivaluedHashMap<>();
        when(responseContext.getHeaders()).thenReturn(headers);
        when(fixture.requestContext.getProperty("canonbridge.ratelimit.result"))
                .thenReturn(new RateLimitResult(true, 10, 8, 123456L, 0L));

        fixture.filter.responseFilter(fixture.requestContext, responseContext);

        assertEquals("10", headers.getFirst("X-RateLimit-Limit"));
        assertEquals("8", headers.getFirst("X-RateLimit-Remaining"));
        assertEquals("123456", headers.getFirst("X-RateLimit-Reset"));
    }

    private static Fixture fixture(String path) {
        return fixture(path, new RateLimitResult(true, 10, 9, System.currentTimeMillis() + 60_000L, 0L));
    }

    private static Fixture fixture(String path, RateLimitResult result) {
        RateLimitFilter filter = new RateLimitFilter();
        RateLimitService rateLimitService = mock(RateLimitService.class);
        RateLimitConfig config = mock(RateLimitConfig.class);
        RateLimitConfig.AuthenticatedConfig authenticated = mock(RateLimitConfig.AuthenticatedConfig.class);
        RateLimitConfig.UnauthenticatedConfig unauthenticated = mock(RateLimitConfig.UnauthenticatedConfig.class);
        HttpServerRequest request = mock(HttpServerRequest.class);
        ContainerRequestContext requestContext = mock(ContainerRequestContext.class);
        UriInfo uriInfo = mock(UriInfo.class);
        SecurityContext securityContext = mock(SecurityContext.class);

        when(config.enabled()).thenReturn(true);
        when(config.authenticated()).thenReturn(authenticated);
        when(config.unauthenticated()).thenReturn(unauthenticated);
        when(authenticated.defaultLimit()).thenReturn(100);
        when(authenticated.windowSeconds()).thenReturn(60);
        when(unauthenticated.defaultLimit()).thenReturn(10);
        when(unauthenticated.windowSeconds()).thenReturn(60);
        when(rateLimitService.checkRateLimit(anyString(), anyInt(), anyInt()))
                .thenReturn(Uni.createFrom().item(result));
        when(uriInfo.getPath()).thenReturn(path);
        when(requestContext.getUriInfo()).thenReturn(uriInfo);
        when(requestContext.getSecurityContext()).thenReturn(securityContext);
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.remoteAddress()).thenReturn(SocketAddress.inetSocketAddress(1234, "127.0.0.1"));

        filter.rateLimitService = rateLimitService;
        filter.config = config;
        filter.request = request;

        return new Fixture(filter, rateLimitService, requestContext);
    }

    private record Fixture(
            RateLimitFilter filter,
            RateLimitService rateLimitService,
            ContainerRequestContext requestContext
    ) {
    }
}
