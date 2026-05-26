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
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SingleTenantContextFilterTest {

    @Test
    void setsDefaultTenantWhenAuthorizedTenantsContainIt() {
        SingleTenantContextFilter filter = filter();
        MultivaluedMap<String, String> headers = new MultivaluedHashMap<>();
        ContainerRequestContext requestContext = requestContext("api/partners", headers, Set.of("tenant-acme"));

        filter.filter(requestContext);

        assertEquals("tenant-acme", headers.getFirst("X-Tenant-Id"));
        verify(requestContext).setProperty(SingleTenantContextFilter.TENANT_ID_PROPERTY, "tenant-acme");
        verify(requestContext, never()).abortWith(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rejectsWhenAuthorizedTenantDoesNotMatchDefault() {
        SingleTenantContextFilter filter = filter();
        MultivaluedMap<String, String> headers = new MultivaluedHashMap<>();
        ContainerRequestContext requestContext = requestContext("api/partners", headers, Set.of("tenant-other"));

        filter.filter(requestContext);

        ArgumentCaptor<Response> response = ArgumentCaptor.forClass(Response.class);
        verify(requestContext).abortWith(response.capture());
        assertEquals(Response.Status.FORBIDDEN.getStatusCode(), response.getValue().getStatus());
    }

    @Test
    void allowsWildcardTenantAccess() {
        SingleTenantContextFilter filter = filter();
        MultivaluedMap<String, String> headers = new MultivaluedHashMap<>();
        ContainerRequestContext requestContext = requestContext("api/partners", headers, Set.of("*"));

        filter.filter(requestContext);

        assertEquals("tenant-acme", headers.getFirst("X-Tenant-Id"));
        verify(requestContext).setProperty(SingleTenantContextFilter.TENANT_ID_PROPERTY, "tenant-acme");
        verify(requestContext, never()).abortWith(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void bypassesAuthLogin() {
        SingleTenantContextFilter filter = filter();
        MultivaluedMap<String, String> headers = new MultivaluedHashMap<>();
        ContainerRequestContext requestContext = requestContext("api/auth/login", headers, Set.of());

        filter.filter(requestContext);

        assertNull(headers.getFirst("X-Tenant-Id"));
        verify(requestContext, never()).setProperty(anyString(), org.mockito.ArgumentMatchers.any());
        verify(requestContext, never()).abortWith(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void extractsUserIdFromPrincipal() {
        SingleTenantContextFilter filter = filter();
        MultivaluedMap<String, String> headers = new MultivaluedHashMap<>();
        ContainerRequestContext requestContext = requestContext("api/partners", headers, Set.of("tenant-acme"), "user:abc-123");

        filter.filter(requestContext);

        verify(requestContext).setProperty(SingleTenantContextFilter.USER_ID_PROPERTY, "abc-123");
        assertEquals("abc-123", headers.getFirst("X-User-Id"));
    }

    private static SingleTenantContextFilter filter() {
        SingleTenantContextFilter filter = new SingleTenantContextFilter();
        filter.singleTenantEnabled = true;
        filter.defaultTenantId = "tenant-acme";
        return filter;
    }

    private static ContainerRequestContext requestContext(String path, MultivaluedMap<String, String> headers, Set<String> authorizedTenants) {
        return requestContext(path, headers, authorizedTenants, "user:test-user");
    }

    private static ContainerRequestContext requestContext(String path, MultivaluedMap<String, String> headers, Set<String> authorizedTenants, String principalName) {
        ContainerRequestContext requestContext = mock(ContainerRequestContext.class);
        UriInfo uriInfo = mock(UriInfo.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        Principal principal = mock(Principal.class);

        when(uriInfo.getPath()).thenReturn(path);
        when(requestContext.getUriInfo()).thenReturn(uriInfo);
        when(requestContext.getMethod()).thenReturn(HttpMethod.GET);
        when(requestContext.getHeaders()).thenReturn(headers);
        when(requestContext.getHeaderString(anyString())).thenAnswer(invocation ->
                headers.getFirst(invocation.getArgument(0, String.class)));
        when(requestContext.getProperty(ApiAuthenticationFilter.AUTHORIZED_TENANTS_PROPERTY)).thenReturn(authorizedTenants);
        when(principal.getName()).thenReturn(principalName);
        when(securityContext.getUserPrincipal()).thenReturn(principal);
        when(requestContext.getSecurityContext()).thenReturn(securityContext);

        return requestContext;
    }
}
