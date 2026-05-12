package com.canonbridge.mappingstudio.audit;

import com.canonbridge.mappingstudio.domain.AuditLog;
import com.canonbridge.mappingstudio.repository.AuditLogRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.time.Instant;

@ApplicationScoped
public class AuditLogService {

    private static final Logger LOG = Logger.getLogger(AuditLogService.class);

    @Inject
    AuditLogRepository auditLogRepository;

    public Uni<Void> log(
            String tenantId,
            String userId,
            AuditLog.AuditAction action,
            String resourceType,
            String resourceId,
            String details,
            AuditLog.AuditOutcome outcome,
            String correlationId) {

        AuditLog entry = new AuditLog();
        entry.setTenantId(tenantId);
        entry.setUserId(userId);
        entry.setAction(action);
        entry.setResourceType(resourceType);
        entry.setResourceId(resourceId);
        entry.setDetails(details);
        entry.setOutcome(outcome);
        entry.setCorrelationId(correlationId);
        entry.setCreatedAt(Instant.now());

        return auditLogRepository.create(entry)
            .onFailure().invoke(throwable ->
                LOG.errorf(throwable, "Failed to persist audit log entry: action=%s resourceId=%s", action, resourceId)
            )
            .replaceWithVoid();
    }

    public Uni<Void> logSuccess(
            String tenantId,
            String userId,
            AuditLog.AuditAction action,
            String resourceType,
            String resourceId,
            String details,
            String correlationId) {
        return log(tenantId, userId, action, resourceType, resourceId, details,
            AuditLog.AuditOutcome.SUCCESS, correlationId);
    }

    public Uni<Void> logFailure(
            String tenantId,
            String userId,
            AuditLog.AuditAction action,
            String resourceType,
            String resourceId,
            String details,
            String correlationId) {
        return log(tenantId, userId, action, resourceType, resourceId, details,
            AuditLog.AuditOutcome.FAILURE, correlationId);
    }
}
