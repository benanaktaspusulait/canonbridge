package com.canonbridge.mappingstudio.ratelimit;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.Map;

@Path("/api/rate-limit-probe")
public class RateLimitProbeResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Map<String, String> probe() {
        return Map.of("status", "ok");
    }
}
