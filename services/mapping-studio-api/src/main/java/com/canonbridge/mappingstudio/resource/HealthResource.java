package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.lifecycle.GracefulShutdownManager;
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

    @Inject
    GracefulShutdownManager shutdownManager;

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

        @Inject
        GracefulShutdownManager shutdownManager;

        @Override
        public HealthCheckResponse call() {
            // Fail readiness check during shutdown
            if (!shutdownManager.isReady()) {
                return HealthCheckResponse.down("shutdown-in-progress");
            }

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
        // Fail readiness check during shutdown
        if (!shutdownManager.isReady()) {
            return Uni.createFrom().item(
                new HealthStatus("DOWN", "shutdown in progress")
            );
        }

        return client.query("SELECT 1")
            .execute()
            .map(rs -> new HealthStatus("UP", "database connection is ready"))
            .onFailure()
            .recoverWithItem(new HealthStatus("DOWN", "database connection failed"));
    }

    @GET
    @Path("/status")
    @Produces(MediaType.APPLICATION_JSON)
    public Uni<ServiceStatus> status() {
        return Uni.createFrom().item(new ServiceStatus(
            shutdownManager.isReady(),
            shutdownManager.isShuttingDown(),
            shutdownManager.getInFlightRequestCount()
        ));
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

    public static class ServiceStatus {
        public boolean ready;
        public boolean shuttingDown;
        public int inFlightRequests;

        public ServiceStatus() {}

        public ServiceStatus(boolean ready, boolean shuttingDown, int inFlightRequests) {
            this.ready = ready;
            this.shuttingDown = shuttingDown;
            this.inFlightRequests = inFlightRequests;
        }
    }
}
