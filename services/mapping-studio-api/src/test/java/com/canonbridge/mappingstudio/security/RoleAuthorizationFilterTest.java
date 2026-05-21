package com.canonbridge.mappingstudio.security;

import jakarta.ws.rs.HttpMethod;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.MultivaluedHashMap;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.UriInfo;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.security.Principal;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RoleAuthorizationFilterTest {

    @Test
    void allowsViewerReadRequests() {
        RoleAuthorizationFilter filter = filter();
        ContainerRequestContext requestContext = requestContext("GET", "api/mapping-drafts", "viewer");

        filter.filter(requestContext);

        verify(requestContext, never()).abortWith(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rejectsViewerDeleteRequests() {
        RoleAuthorizationFilter filter = filter();
        ContainerRequestContext requestContext = requestContext("DELETE", "api/mapping-drafts/123", "viewer");

        filter.filter(requestContext);

        ArgumentCaptor<Response> response = ArgumentCaptor.forClass(Response.class);
        verify(requestContext).abortWith(response.capture());
        assertEquals(Response.Status.FORBIDDEN.getStatusCode(), response.getValue().getStatus());
    }

    @Test
    void allowsOperatorProxyExecution() {
        RoleAuthorizationFilter filter = filter();
        ContainerRequestContext requestContext = requestContext(
                "POST",
                "api/proxy/00000000-0000-0000-0000-000000000001",
                "operator");

        filter.filter(requestContext);

        verify(requestContext, never()).abortWith(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rejectsViewerProxyExecution() {
        RoleAuthorizationFilter filter = filter();
        ContainerRequestContext requestContext = requestContext(
                "POST",
                "api/proxy/00000000-0000-0000-0000-000000000001",
                "viewer");

        filter.filter(requestContext);

        ArgumentCaptor<Response> response = ArgumentCaptor.forClass(Response.class);
        verify(requestContext).abortWith(response.capture());
        assertEquals(Response.Status.FORBIDDEN.getStatusCode(), response.getValue().getStatus());
    }

    @Test
    void normalizesEncodedAndDuplicateSlashPathsBeforeRoleMatching() {
        assertEquals("api/credentials", RoleAuthorizationFilter.normalizePath("api//credentials"));
        assertEquals("api/audit-logs", RoleAuthorizationFilter.normalizePath("api/credentials/%2E%2E/audit-logs"));
    }

    private static RoleAuthorizationFilter filter() {
        RoleAuthorizationFilter filter = new RoleAuthorizationFilter();
        filter.authEnabled = true;
        filter.rbacEnabled = true;
        filter.defaultTenantId = "tenant-acme";
        filter.tenantHeaderName = "X-Tenant-Id";
        return filter;
    }

    private static ContainerRequestContext requestContext(String method, String path, String role) {
        ContainerRequestContext requestContext = mock(ContainerRequestContext.class);
        UriInfo uriInfo = mock(UriInfo.class);
        MultivaluedMap<String, String> headers = new MultivaluedHashMap<>();
        SecurityContext securityContext = securityContext(role);

        when(uriInfo.getPath()).thenReturn(path);
        when(requestContext.getUriInfo()).thenReturn(uriInfo);
        when(requestContext.getMethod()).thenReturn(method);
        when(requestContext.getHeaders()).thenReturn(headers);
        when(requestContext.getHeaderString(anyString())).thenAnswer(invocation ->
                headers.getFirst(invocation.getArgument(0, String.class)));
        when(requestContext.getSecurityContext()).thenReturn(securityContext);

        return requestContext;
    }

    private static SecurityContext securityContext(String role) {
        SecurityContext securityContext = mock(SecurityContext.class);
        Principal principal = () -> "user:test";
        Set<String> roles = Set.of(role);

        when(securityContext.getUserPrincipal()).thenReturn(principal);
        when(securityContext.isUserInRole(anyString())).thenAnswer(invocation ->
                roles.contains(invocation.getArgument(0, String.class)));

        return securityContext;
    }
}
