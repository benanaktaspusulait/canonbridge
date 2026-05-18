package com.canonbridge.mappingstudio.filter;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.MDC;

import java.util.UUID;

/**
 * JAX-RS filter that ensures every request has a correlation ID.
 * 
 * - Reads X-Correlation-Id header from incoming request (if present)
 * - Generates a new one if not provided
 * - Puts it in MDC so all log lines include it
 * - Returns it in the response header for client tracing
 */
@Provider
public class CorrelationIdFilter implements ContainerRequestFilter, ContainerResponseFilter {

    public static final String CORRELATION_HEADER = "X-Correlation-Id";
    public static final String MDC_KEY = "correlationId";
    public static final String TENANT_MDC_KEY = "tenantId";
    public static final String MAPPING_MDC_KEY = "mappingId";

    @Override
    public void filter(ContainerRequestContext requestContext) {
        // Get or generate correlation ID
        String correlationId = requestContext.getHeaderString(CORRELATION_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString().substring(0, 8);
        }
        
        // Put in MDC for structured logging
        MDC.put(MDC_KEY, correlationId);
        
        // Also add tenant ID to MDC if present
        String tenantId = requestContext.getHeaderString("X-Tenant-Id");
        if (tenantId != null && !tenantId.isBlank()) {
            MDC.put(TENANT_MDC_KEY, tenantId);
        }
        
        // Store in request context for downstream use
        requestContext.setProperty(MDC_KEY, correlationId);
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) {
        // Add correlation ID to response header
        String correlationId = (String) requestContext.getProperty(MDC_KEY);
        if (correlationId != null) {
            responseContext.getHeaders().putSingle(CORRELATION_HEADER, correlationId);
        }
        
        // Clean up MDC
        MDC.remove(MDC_KEY);
        MDC.remove(TENANT_MDC_KEY);
        MDC.remove(MAPPING_MDC_KEY);
    }
}
