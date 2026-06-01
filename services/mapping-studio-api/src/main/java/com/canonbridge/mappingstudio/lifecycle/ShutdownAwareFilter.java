package com.canonbridge.mappingstudio.lifecycle;

import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

/**
 * [MS-M7] Wires GracefulShutdownManager's request counting.
 * Rejects new requests during shutdown with 503.
 */
@Provider
@ApplicationScoped
@Priority(Priorities.USER - 200)
public class ShutdownAwareFilter implements ContainerRequestFilter, ContainerResponseFilter {

    @Inject
    GracefulShutdownManager shutdownManager;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (shutdownManager.isShuttingDown()) {
            requestContext.abortWith(
                Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity("{\"error\":\"Service is shutting down\"}")
                    .build()
            );
            return;
        }
        shutdownManager.requestStarted();
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) {
        shutdownManager.requestCompleted();
    }
}
