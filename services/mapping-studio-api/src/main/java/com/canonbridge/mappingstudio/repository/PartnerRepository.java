package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.Partner;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.RowSet;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class PartnerRepository {

    @Inject
    PgPool client;

    public Uni<List<Partner>> findByTenantId(String tenantId) {
        return client.preparedQuery(
            "SELECT * FROM partners WHERE tenant_id = $1 ORDER BY created_at DESC"
        )
        .execute(Tuple.of(tenantId))
        .map(this::toPartnerList);
    }

    public Uni<Partner> findById(String tenantId, UUID id) {
        return client.preparedQuery(
            "SELECT * FROM partners WHERE tenant_id = $1 AND id = $2"
        )
        .execute(Tuple.of(tenantId, id))
        .map(rowSet -> {
            if (rowSet.size() == 0) {
                return null;
            }
            return toPartner(rowSet.iterator().next());
        });
    }

    public Uni<Partner> findByExternalId(String tenantId, String externalId) {
        return client.preparedQuery(
            "SELECT * FROM partners WHERE tenant_id = $1 AND external_id = $2"
        )
        .execute(Tuple.of(tenantId, externalId))
        .map(rowSet -> {
            if (rowSet.size() == 0) {
                return null;
            }
            return toPartner(rowSet.iterator().next());
        });
    }

    public Uni<Partner> create(Partner partner) {
        partner.setId(UUID.randomUUID());
        Instant now = Instant.now();
        partner.setCreatedAt(now);
        partner.setUpdatedAt(now);

        return client.preparedQuery(
            "INSERT INTO partners (id, tenant_id, external_id, name, description, status, metadata, created_at, updated_at, created_by, updated_by) " +
            "VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11) " +
            "RETURNING *"
        )
        .execute(Tuple.of(
            partner.getId(),
            partner.getTenantId(),
            partner.getExternalId(),
            partner.getName(),
            partner.getDescription(),
            partner.getStatus().name(),
            partner.getMetadata(),
            LocalDateTime.ofInstant(partner.getCreatedAt(), ZoneOffset.UTC),
            LocalDateTime.ofInstant(partner.getUpdatedAt(), ZoneOffset.UTC),
            partner.getCreatedBy(),
            partner.getUpdatedBy()
        ))
        .map(rowSet -> toPartner(rowSet.iterator().next()));
    }

    public Uni<Partner> update(Partner partner) {
        partner.setUpdatedAt(Instant.now());

        return client.preparedQuery(
            "UPDATE partners SET " +
            "external_id = $1, name = $2, description = $3, status = $4, " +
            "metadata = $5::jsonb, updated_at = $6, updated_by = $7 " +
            "WHERE tenant_id = $8 AND id = $9 " +
            "RETURNING *"
        )
        .execute(Tuple.of(
            partner.getExternalId(),
            partner.getName(),
            partner.getDescription(),
            partner.getStatus().name(),
            partner.getMetadata(),
            LocalDateTime.ofInstant(partner.getUpdatedAt(), ZoneOffset.UTC),
            partner.getUpdatedBy(),
            partner.getTenantId(),
            partner.getId()
        ))
        .map(rowSet -> {
            if (rowSet.size() == 0) {
                return null;
            }
            return toPartner(rowSet.iterator().next());
        });
    }

    public Uni<Boolean> delete(String tenantId, UUID id) {
        return client.preparedQuery(
            "DELETE FROM partners WHERE tenant_id = $1 AND id = $2"
        )
        .execute(Tuple.of(tenantId, id))
        .map(rowSet -> rowSet.rowCount() > 0);
    }

    private List<Partner> toPartnerList(RowSet<Row> rows) {
        List<Partner> partners = new ArrayList<>();
        for (Row row : rows) {
            partners.add(toPartner(row));
        }
        return partners;
    }

    private Partner toPartner(Row row) {
        Partner partner = new Partner();
        partner.setId(row.getUUID("id"));
        partner.setTenantId(row.getString("tenant_id"));
        partner.setExternalId(row.getString("external_id"));
        partner.setName(row.getString("name"));
        partner.setDescription(row.getString("description"));
        partner.setStatus(Partner.PartnerStatus.valueOf(row.getString("status")));
        partner.setMetadata(row.getString("metadata"));
        partner.setCreatedAt(row.getLocalDateTime("created_at").toInstant(java.time.ZoneOffset.UTC));
        partner.setUpdatedAt(row.getLocalDateTime("updated_at").toInstant(java.time.ZoneOffset.UTC));
        partner.setCreatedBy(row.getString("created_by"));
        partner.setUpdatedBy(row.getString("updated_by"));
        return partner;
    }
}
