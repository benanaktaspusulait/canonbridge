package com.canonbridge.mappingstudio.resource;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

/**
 * Global exception mapper providing consistent JSON error responses across all resources.
 * 
 * All error responses follow the shape:
 * <pre>
 * {
 *   "error": "error_code",
 *   "message": "Human-readable description"
 * }
 * </pre>
 */
public class GlobalExceptionMapper {

    private static final Logger LOG = Logger.getLogger(GlobalExceptionMapper.class);

    @ServerExceptionMapper(BadRequestException.class)
    public Response handleBadRequest(BadRequestException ex) {
        return errorResponse(Response.Status.BAD_REQUEST, "bad_request", ex.getMessage());
    }

    @ServerExceptionMapper(NotFoundException.class)
    public Response handleNotFound(NotFoundException ex) {
        return errorResponse(Response.Status.NOT_FOUND, "not_found", ex.getMessage());
    }

    @ServerExceptionMapper(NotAuthorizedException.class)
    public Response handleUnauthorized(NotAuthorizedException ex) {
        return errorResponse(Response.Status.UNAUTHORIZED, "unauthorized", ex.getMessage());
    }

    @ServerExceptionMapper(ForbiddenException.class)
    public Response handleForbidden(ForbiddenException ex) {
        return errorResponse(Response.Status.FORBIDDEN, "forbidden", ex.getMessage());
    }

    @ServerExceptionMapper(IllegalArgumentException.class)
    public Response handleIllegalArgument(IllegalArgumentException ex) {
        return errorResponse(Response.Status.BAD_REQUEST, "invalid_argument", ex.getMessage());
    }

    @ServerExceptionMapper(WebApplicationException.class)
    public Response handleWebApplication(WebApplicationException ex) {
        Response original = ex.getResponse();
        int status = original != null ? original.getStatus() : 500;
        String code = status >= 500 ? "internal_error" : "request_error";
        return errorResponse(Response.Status.fromStatusCode(status), code, ex.getMessage());
    }

    @ServerExceptionMapper(Exception.class)
    public Response handleGeneric(Exception ex) {
        LOG.error("Unhandled exception in resource", ex);
        return errorResponse(
                Response.Status.INTERNAL_SERVER_ERROR,
                "internal_error",
                "An unexpected error occurred");
    }

    private Response errorResponse(Response.Status status, String error, String message) {
        return Response.status(status)
                .type(MediaType.APPLICATION_JSON_TYPE)
                .entity(new ErrorResponse(error, message != null ? message : status.getReasonPhrase()))
                .build();
    }

    public record ErrorResponse(String error, String message) {
    }
}
