package com.canonbridge.mappingstudio.resource;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Liveness;
import org.eclipse.microprofile.health.Readiness;

@Path("/health")
public class HealthResource {

    @Inject
    PgPool client;

    @Liveness
    public static class LivenessCheck implements HealthCheck {
        @Override
        public HealthCheckResponse call() {
            return HealthCheckResponse.up("mapping-studio-api");
        }
    }

    @Readiness
    public static class ReadinessCheck implements HealthCheck {
        
        @Inject
        PgPool client;

        @Override
        public HealthCheckResponse call() {
            try {
                client.query("SELECT 1")
                    .execute()
                    .await()
                    .indefinitely();
                return HealthCheckResponse.up("database");
            } catch (Exception e) {
                return HealthCheckResponse.down("database");
            }
        }
    }

    @GET
    @Path("/live")
    @Produces(MediaType.APPLICATION_JSON)
    public Uni<HealthStatus> live() {
        return Uni.createFrom().item(new HealthStatus("UP", "mapping-studio-api is alive"));
    }

    @GET
    @Path("/ready")
    @Produces(MediaType.APPLICATION_JSON)
    public Uni<HealthStatus> ready() {
        return client.query("SELECT 1")
            .execute()
            .map(rs -> new HealthStatus("UP", "database connection is ready"))
            .onFailure()
            .recoverWithItem(new HealthStatus("DOWN", "database connection failed"));
    }

    public static class HealthStatus {
        public String status;
        public String message;

        public HealthStatus() {}

        public HealthStatus(String status, String message) {
            this.status = status;
            this.message = message;
        }
    }
}
