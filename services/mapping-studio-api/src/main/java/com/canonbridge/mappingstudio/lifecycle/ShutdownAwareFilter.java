package com.canonbridge.mappingstudio.lifecycle;

import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.io.IOException;

/**
 * Filter that tracks in-flight requests and rejects new requests during shutdown.
 * 
 * This filter:
 * - Increments the in-flight request counter when a request starts
 * - Decrements the counter when a request completes
 * - Returns 503 Service Unavailable for new requests during shutdown
 * - Excludes health check endpoints from shutdown rejection
 */
@Provider
public class ShutdownAwareFilter implements ContainerRequestFilter, ContainerResponseFilter {

    private static final Logger LOG = Logger.getLogger(ShutdownAwareFilter.class);

    @Inject
    GracefulShutdownManager shutdownManager;

    private static final String REQUEST_TRACKED_KEY = "canonbridge.request.tracked";

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String path = requestContext.getUriInfo().getPath();
        
        // Always allow health check endpoints
        if (isHealthCheckEndpoint(path)) {
            return;
        }

        // Reject new requests during shutdown
        if (shutdownManager.isShuttingDown()) {
            LOG.warnf("Rejecting request to %s - shutdown in progress", path);
            requestContext.abortWith(
                Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity(new ErrorResponse(
                        "service_unavailable",
                        "Service is shutting down and not accepting new requests"
                    ))
                    .build()
            );
            return;
        }

        // Track this request
        shutdownManager.requestStarted();
        requestContext.setProperty(REQUEST_TRACKED_KEY, true);
    }

    @Override
    public void filter(ContainerRequestContext requestContext, 
                      ContainerResponseContext responseContext) throws IOException {
        // Decrement counter if this request was tracked
        Boolean tracked = (Boolean) requestContext.getProperty(REQUEST_TRACKED_KEY);
        if (Boolean.TRUE.equals(tracked)) {
            shutdownManager.requestCompleted();
        }
    }

    /**
     * Checks if the path is a health check endpoint that should always be accessible.
     */
    private boolean isHealthCheckEndpoint(String path) {
        return path.startsWith("health") || 
               path.startsWith("/health") ||
               path.startsWith("q/health") ||
               path.startsWith("/q/health");
    }

    /**
     * Error response for 503 Service Unavailable.
     */
    public static class ErrorResponse {
        public String error;
        public String message;

        public ErrorResponse() {}

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }
    }
}
