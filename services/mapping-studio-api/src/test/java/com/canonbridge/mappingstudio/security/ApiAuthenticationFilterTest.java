package com.canonbridge.mappingstudio.security;

import jakarta.ws.rs.HttpMethod;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.MultivaluedHashMap;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.PathSegment;
import jakarta.ws.rs.core.Request;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.UriBuilder;
import jakarta.ws.rs.core.UriInfo;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.net.URI;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class ApiAuthenticationFilterTest {

    @Test
    void rejectsApiRequestsWithoutCredentials() {
        ApiAuthenticationFilter filter = filterWithKey("test-secret");
        FakeRequestContext requestContext = new FakeRequestContext("api/partners");

        filter.filter(requestContext);

        assertNotNull(requestContext.abortedResponse);
        assertEquals(Response.Status.UNAUTHORIZED.getStatusCode(), requestContext.abortedResponse.getStatus());
        ApiAuthenticationFilter.AuthErrorResponse error =
                (ApiAuthenticationFilter.AuthErrorResponse) requestContext.abortedResponse.getEntity();
        assertEquals("missing_credentials", error.error());
    }

    @Test
    void acceptsApiRequestsWithValidApiKeyHeader() {
        ApiAuthenticationFilter filter = filterWithKey("test-secret");
        FakeRequestContext requestContext = new FakeRequestContext("api/partners");
        requestContext.header("X-API-Key", "test-secret");

        filter.filter(requestContext);

        assertNull(requestContext.abortedResponse);
        assertNotNull(requestContext.securityContext);
        assertEquals("api-key", requestContext.securityContext.getUserPrincipal().getName());
    }

    @Test
    void bypassesNonApiRequests() {
        ApiAuthenticationFilter filter = filterWithKey("test-secret");
        FakeRequestContext requestContext = new FakeRequestContext("health/live");

        filter.filter(requestContext);

        assertNull(requestContext.abortedResponse);
    }

    private static ApiAuthenticationFilter filterWithKey(String apiKey) {
        ApiAuthenticationFilter filter = new ApiAuthenticationFilter();
        filter.authEnabled = true;
        filter.apiKeyHeaderName = "X-API-Key";
        filter.authenticator = new ApiKeyAuthenticator(Set.of(apiKey));
        return filter;
    }

    private static class FakeRequestContext implements ContainerRequestContext {
        private final String path;
        private final MultivaluedMap<String, String> headers = new MultivaluedHashMap<>();
        private String method = HttpMethod.GET;
        private Response abortedResponse;
        private SecurityContext securityContext;

        FakeRequestContext(String path) {
            this.path = path;
        }

        void header(String name, String value) {
            headers.add(name, value);
        }

        @Override
        public Object getProperty(String name) {
            return null;
        }

        @Override
        public Collection<String> getPropertyNames() {
            return List.of();
        }

        @Override
        public void setProperty(String name, Object object) {
        }

        @Override
        public void removeProperty(String name) {
        }

        @Override
        public UriInfo getUriInfo() {
            return new FakeUriInfo(path);
        }

        @Override
        public void setRequestUri(URI requestUri) {
        }

        @Override
        public void setRequestUri(URI baseUri, URI requestUri) {
        }

        @Override
        public Request getRequest() {
            throw new UnsupportedOperationException();
        }

        @Override
        public String getMethod() {
            return method;
        }

        @Override
        public void setMethod(String method) {
            this.method = method;
        }

        @Override
        public MultivaluedMap<String, String> getHeaders() {
            return headers;
        }

        @Override
        public String getHeaderString(String name) {
            return headers.getFirst(name);
        }

        @Override
        public Date getDate() {
            return null;
        }

        @Override
        public Locale getLanguage() {
            return null;
        }

        @Override
        public int getLength() {
            return -1;
        }

        @Override
        public MediaType getMediaType() {
            return null;
        }

        @Override
        public List<MediaType> getAcceptableMediaTypes() {
            return List.of();
        }

        @Override
        public List<Locale> getAcceptableLanguages() {
            return List.of();
        }

        @Override
        public Map<String, Cookie> getCookies() {
            return Map.of();
        }

        @Override
        public boolean hasEntity() {
            return false;
        }

        @Override
        public InputStream getEntityStream() {
            return InputStream.nullInputStream();
        }

        @Override
        public void setEntityStream(InputStream input) {
        }

        @Override
        public SecurityContext getSecurityContext() {
            return securityContext;
        }

        @Override
        public void setSecurityContext(SecurityContext context) {
            this.securityContext = context;
        }

        @Override
        public void abortWith(Response response) {
            this.abortedResponse = response;
        }
    }

    private record FakeUriInfo(String path) implements UriInfo {
        @Override
        public String getPath() {
            return path;
        }

        @Override
        public String getPath(boolean decode) {
            return path;
        }

        @Override
        public List<PathSegment> getPathSegments() {
            throw new UnsupportedOperationException();
        }

        @Override
        public List<PathSegment> getPathSegments(boolean decode) {
            throw new UnsupportedOperationException();
        }

        @Override
        public URI getRequestUri() {
            throw new UnsupportedOperationException();
        }

        @Override
        public UriBuilder getRequestUriBuilder() {
            throw new UnsupportedOperationException();
        }

        @Override
        public URI getAbsolutePath() {
            throw new UnsupportedOperationException();
        }

        @Override
        public UriBuilder getAbsolutePathBuilder() {
            throw new UnsupportedOperationException();
        }

        @Override
        public URI getBaseUri() {
            throw new UnsupportedOperationException();
        }

        @Override
        public UriBuilder getBaseUriBuilder() {
            throw new UnsupportedOperationException();
        }

        @Override
        public MultivaluedMap<String, String> getPathParameters() {
            throw new UnsupportedOperationException();
        }

        @Override
        public MultivaluedMap<String, String> getPathParameters(boolean decode) {
            throw new UnsupportedOperationException();
        }

        @Override
        public MultivaluedMap<String, String> getQueryParameters() {
            throw new UnsupportedOperationException();
        }

        @Override
        public MultivaluedMap<String, String> getQueryParameters(boolean decode) {
            throw new UnsupportedOperationException();
        }

        @Override
        public List<String> getMatchedURIs() {
            throw new UnsupportedOperationException();
        }

        @Override
        public List<String> getMatchedURIs(boolean decode) {
            throw new UnsupportedOperationException();
        }

        @Override
        public List<Object> getMatchedResources() {
            throw new UnsupportedOperationException();
        }

        @Override
        public URI resolve(URI uri) {
            throw new UnsupportedOperationException();
        }

        @Override
        public URI relativize(URI uri) {
            throw new UnsupportedOperationException();
        }
    }
}
