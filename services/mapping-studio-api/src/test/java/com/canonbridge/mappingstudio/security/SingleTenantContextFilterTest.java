package com.canonbridge.mappingstudio.security;

import jakarta.ws.rs.HttpMethod;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.MultivaluedHashMap;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SingleTenantContextFilterTest {

    @Test
    void injectsDefaultTenantWhenHeaderIsMissing() {
        SingleTenantContextFilter filter = filter();
        MultivaluedMap<String, String> headers = new MultivaluedHashMap<>();
        ContainerRequestContext requestContext = requestContext("api/partners", headers);

        filter.filter(requestContext);

        assertEquals("tenant-acme", headers.getFirst("X-Tenant-Id"));
        verify(requestContext).setProperty(SingleTenantContextFilter.TENANT_ID_PROPERTY, "tenant-acme");
        verify(requestContext, never()).abortWith(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rejectsNonDefaultTenant() {
        SingleTenantContextFilter filter = filter();
        MultivaluedMap<String, String> headers = new MultivaluedHashMap<>();
        headers.putSingle("X-Tenant-Id", "tenant-other");
        ContainerRequestContext requestContext = requestContext("api/partners", headers);

        filter.filter(requestContext);

        ArgumentCaptor<Response> response = ArgumentCaptor.forClass(Response.class);
        verify(requestContext).abortWith(response.capture());
        assertEquals(Response.Status.FORBIDDEN.getStatusCode(), response.getValue().getStatus());
        assertEquals("tenant-other", headers.getFirst("X-Tenant-Id"));
    }

    @Test
    void bypassesAuthLogin() {
        SingleTenantContextFilter filter = filter();
        MultivaluedMap<String, String> headers = new MultivaluedHashMap<>();
        ContainerRequestContext requestContext = requestContext("api/auth/login", headers);

        filter.filter(requestContext);

        assertNull(headers.getFirst("X-Tenant-Id"));
        verify(requestContext, never()).setProperty(anyString(), org.mockito.ArgumentMatchers.any());
        verify(requestContext, never()).abortWith(org.mockito.ArgumentMatchers.any());
    }

    private static SingleTenantContextFilter filter() {
        SingleTenantContextFilter filter = new SingleTenantContextFilter();
        filter.singleTenantEnabled = true;
        filter.defaultTenantId = "tenant-acme";
        filter.tenantHeaderName = "X-Tenant-Id";
        return filter;
    }

    private static ContainerRequestContext requestContext(String path, MultivaluedMap<String, String> headers) {
        ContainerRequestContext requestContext = mock(ContainerRequestContext.class);
        UriInfo uriInfo = mock(UriInfo.class);

        when(uriInfo.getPath()).thenReturn(path);
        when(requestContext.getUriInfo()).thenReturn(uriInfo);
        when(requestContext.getMethod()).thenReturn(HttpMethod.GET);
        when(requestContext.getHeaders()).thenReturn(headers);
        when(requestContext.getHeaderString(anyString())).thenAnswer(invocation ->
                headers.getFirst(invocation.getArgument(0, String.class)));

        return requestContext;
    }
}
