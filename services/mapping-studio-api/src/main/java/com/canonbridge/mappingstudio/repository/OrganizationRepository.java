package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.Organization;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class OrganizationRepository {

    @Inject
    PgPool client;

    public Uni<Organization> findById(UUID id) {
        String sql = """
            SELECT id, tenant_id, name, slug, owner_user_id, billing_email,
                   country, vat_id, status, metadata, created_at, updated_at
            FROM organizations
            WHERE id = $1
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(id))
            .map(rowSet -> {
                if (rowSet.size() == 0) return null;
                return mapRow(rowSet.iterator().next());
            });
    }

    public Uni<Organization> findBySlug(String slug) {
        String sql = """
            SELECT id, tenant_id, name, slug, owner_user_id, billing_email,
                   country, vat_id, status, metadata, created_at, updated_at
            FROM organizations
            WHERE slug = $1
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(slug))
            .map(rowSet -> {
                if (rowSet.size() == 0) return null;
                return mapRow(rowSet.iterator().next());
            });
    }

    public Uni<List<Organization>> findByUserId(UUID userId) {
        String sql = """
            SELECT o.id, o.tenant_id, o.name, o.slug, o.owner_user_id, o.billing_email,
                   o.country, o.vat_id, o.status, o.metadata, o.created_at, o.updated_at
            FROM organizations o
            JOIN org_members om ON om.org_id = o.id
            WHERE om.user_id = $1 AND o.status = 'ACTIVE'
            ORDER BY o.name
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(userId))
            .map(rowSet -> {
                List<Organization> orgs = new ArrayList<>();
                for (Row row : rowSet) {
                    orgs.add(mapRow(row));
                }
                return orgs;
            });
    }

    public Uni<List<Organization>> findByTenantId(String tenantId) {
        String sql = """
            SELECT id, tenant_id, name, slug, owner_user_id, billing_email,
                   country, vat_id, status, metadata, created_at, updated_at
            FROM organizations
            WHERE tenant_id = $1
            ORDER BY name
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(tenantId))
            .map(rowSet -> {
                List<Organization> orgs = new ArrayList<>();
                for (Row row : rowSet) {
                    orgs.add(mapRow(row));
                }
                return orgs;
            });
    }

    public Uni<Organization> create(Organization org) {
        String sql = """
            INSERT INTO organizations (id, tenant_id, name, slug, owner_user_id, billing_email, country, vat_id, status, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
            RETURNING id, tenant_id, name, slug, owner_user_id, billing_email, country, vat_id, status, metadata, created_at, updated_at
            """;

        UUID id = org.getId() != null ? org.getId() : UUID.randomUUID();

        return client.preparedQuery(sql)
            .execute(SqlParams.of(
                id,
                org.getTenantId(),
                org.getName(),
                org.getSlug(),
                org.getOwnerUserId(),
                org.getBillingEmail(),
                org.getCountry(),
                org.getVatId(),
                org.getStatus() != null ? org.getStatus().name() : "ACTIVE",
                org.getMetadata() != null ? org.getMetadata() : "{}"
            ))
            .map(rowSet -> mapRow(rowSet.iterator().next()));
    }

    public Uni<Organization> update(Organization org) {
        String sql = """
            UPDATE organizations
            SET name = $2, slug = $3, billing_email = $4, country = $5, vat_id = $6,
                status = $7, metadata = $8::jsonb
            WHERE id = $1
            RETURNING id, tenant_id, name, slug, owner_user_id, billing_email, country, vat_id, status, metadata, created_at, updated_at
            """;

        return client.preparedQuery(sql)
            .execute(SqlParams.of(
                org.getId(),
                org.getName(),
                org.getSlug(),
                org.getBillingEmail(),
                org.getCountry(),
                org.getVatId(),
                org.getStatus() != null ? org.getStatus().name() : "ACTIVE",
                org.getMetadata() != null ? org.getMetadata() : "{}"
            ))
            .map(rowSet -> {
                if (rowSet.size() == 0) return null;
                return mapRow(rowSet.iterator().next());
            });
    }

    public Uni<Boolean> delete(UUID id) {
        String sql = "DELETE FROM organizations WHERE id = $1";
        return client.preparedQuery(sql)
            .execute(Tuple.of(id))
            .map(rowSet -> rowSet.rowCount() > 0);
    }

    private Organization mapRow(Row row) {
        Organization org = new Organization();
        org.setId(row.getUUID("id"));
        org.setTenantId(row.getString("tenant_id"));
        org.setName(row.getString("name"));
        org.setSlug(row.getString("slug"));
        org.setOwnerUserId(row.getUUID("owner_user_id"));
        org.setBillingEmail(row.getString("billing_email"));
        org.setCountry(row.getString("country"));
        org.setVatId(row.getString("vat_id"));
        org.setStatus(Organization.OrgStatus.valueOf(row.getString("status")));
        org.setMetadata(row.getString("metadata"));
        org.setCreatedAt(row.getLocalDateTime("created_at").toInstant(ZoneOffset.UTC));
        org.setUpdatedAt(row.getLocalDateTime("updated_at").toInstant(ZoneOffset.UTC));
        return org;
    }
}
