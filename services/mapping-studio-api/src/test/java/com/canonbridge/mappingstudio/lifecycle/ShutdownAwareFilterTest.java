package com.canonbridge.mappingstudio.lifecycle;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ShutdownAwareFilter.
 */
@QuarkusTest
class ShutdownAwareFilterTest {

    private ShutdownAwareFilter filter;
    private GracefulShutdownManager shutdownManager;
    private ContainerRequestContext requestContext;
    private ContainerResponseContext responseContext;
    private UriInfo uriInfo;

    @BeforeEach
    void setUp() {
        filter = new ShutdownAwareFilter();
        shutdownManager = mock(GracefulShutdownManager.class);
        filter.shutdownManager = shutdownManager;

        requestContext = mock(ContainerRequestContext.class);
        responseContext = mock(ContainerResponseContext.class);
        uriInfo = mock(UriInfo.class);
        
        when(requestContext.getUriInfo()).thenReturn(uriInfo);
    }

    @Test
    void testNormalRequestIsTracked() throws IOException {
        // Setup
        when(uriInfo.getPath()).thenReturn("/api/mappings");
        when(shutdownManager.isShuttingDown()).thenReturn(false);

        // Execute request filter
        filter.filter(requestContext);

        // Verify request was tracked
        verify(shutdownManager).requestStarted();
        verify(requestContext).setProperty(eq("canonbridge.request.tracked"), eq(true));
        verify(requestContext, never()).abortWith(any());
    }

    @Test
    void testRequestCompletionDecrementsCounter() throws IOException {
        // Setup
        when(requestContext.getProperty("canonbridge.request.tracked")).thenReturn(true);

        // Execute response filter
        filter.filter(requestContext, responseContext);

        // Verify request was completed
        verify(shutdownManager).requestCompleted();
    }

    @Test
    void testUntrackedRequestDoesNotDecrementCounter() throws IOException {
        // Setup - request was not tracked
        when(requestContext.getProperty("canonbridge.request.tracked")).thenReturn(null);

        // Execute response filter
        filter.filter(requestContext, responseContext);

        // Verify counter was not decremented
        verify(shutdownManager, never()).requestCompleted();
    }

    @Test
    void testRequestRejectedDuringShutdown() throws IOException {
        // Setup
        when(uriInfo.getPath()).thenReturn("/api/mappings");
        when(shutdownManager.isShuttingDown()).thenReturn(true);

        // Execute request filter
        filter.filter(requestContext);

        // Verify request was rejected
        ArgumentCaptor<Response> responseCaptor = ArgumentCaptor.forClass(Response.class);
        verify(requestContext).abortWith(responseCaptor.capture());
        
        Response response = responseCaptor.getValue();
        assertEquals(Response.Status.SERVICE_UNAVAILABLE.getStatusCode(), response.getStatus());
        
        // Verify request was not tracked
        verify(shutdownManager, never()).requestStarted();
    }

    @Test
    void testHealthCheckAllowedDuringShutdown() throws IOException {
        // Setup
        when(uriInfo.getPath()).thenReturn("health/ready");
        when(shutdownManager.isShuttingDown()).thenReturn(true);

        // Execute request filter
        filter.filter(requestContext);

        // Verify request was not rejected
        verify(requestContext, never()).abortWith(any());
        
        // Verify request was not tracked (health checks don't count)
        verify(shutdownManager, never()).requestStarted();
    }

    @Test
    void testHealthCheckWithSlashAllowedDuringShutdown() throws IOException {
        // Setup
        when(uriInfo.getPath()).thenReturn("/health/live");
        when(shutdownManager.isShuttingDown()).thenReturn(true);

        // Execute request filter
        filter.filter(requestContext);

        // Verify request was not rejected
        verify(requestContext, never()).abortWith(any());
    }

    @Test
    void testQuarkusHealthCheckAllowedDuringShutdown() throws IOException {
        // Setup
        when(uriInfo.getPath()).thenReturn("q/health/ready");
        when(shutdownManager.isShuttingDown()).thenReturn(true);

        // Execute request filter
        filter.filter(requestContext);

        // Verify request was not rejected
        verify(requestContext, never()).abortWith(any());
    }

    @Test
    void testQuarkusHealthCheckWithSlashAllowedDuringShutdown() throws IOException {
        // Setup
        when(uriInfo.getPath()).thenReturn("/q/health/live");
        when(shutdownManager.isShuttingDown()).thenReturn(true);

        // Execute request filter
        filter.filter(requestContext);

        // Verify request was not rejected
        verify(requestContext, never()).abortWith(any());
    }

    @Test
    void testNonHealthCheckRejectedDuringShutdown() throws IOException {
        // Setup
        when(uriInfo.getPath()).thenReturn("/api/partners");
        when(shutdownManager.isShuttingDown()).thenReturn(true);

        // Execute request filter
        filter.filter(requestContext);

        // Verify request was rejected
        verify(requestContext).abortWith(any());
    }

    @Test
    void testErrorResponseStructure() {
        ShutdownAwareFilter.ErrorResponse error = 
            new ShutdownAwareFilter.ErrorResponse("test_error", "Test message");
        
        assertEquals("test_error", error.error);
        assertEquals("Test message", error.message);
    }
}
