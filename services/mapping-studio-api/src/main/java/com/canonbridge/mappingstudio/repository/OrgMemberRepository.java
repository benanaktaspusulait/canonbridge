package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.OrgMember;
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
public class OrgMemberRepository {

    @Inject
    PgPool client;

    public Uni<List<OrgMember>> findByOrgId(UUID orgId) {
        String sql = """
            SELECT om.id, om.org_id, om.user_id, om.role, om.invited_at, om.accepted_at, om.invited_by,
                   u.email AS user_email, u.name AS user_name
            FROM org_members om
            JOIN users u ON u.id = om.user_id
            WHERE om.org_id = $1
            ORDER BY om.role, u.name
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(rowSet -> {
                List<OrgMember> members = new ArrayList<>();
                for (Row row : rowSet) {
                    members.add(mapRow(row));
                }
                return members;
            });
    }

    public Uni<OrgMember> findByOrgAndUser(UUID orgId, UUID userId) {
        String sql = """
            SELECT om.id, om.org_id, om.user_id, om.role, om.invited_at, om.accepted_at, om.invited_by,
                   u.email AS user_email, u.name AS user_name
            FROM org_members om
            JOIN users u ON u.id = om.user_id
            WHERE om.org_id = $1 AND om.user_id = $2
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId, userId))
            .map(rowSet -> {
                if (rowSet.size() == 0) return null;
                return mapRow(rowSet.iterator().next());
            });
    }

    public Uni<OrgMember> addMember(UUID orgId, UUID userId, OrgMember.OrgRole role, UUID invitedBy) {
        String sql = """
            INSERT INTO org_members (id, org_id, user_id, role, invited_at, accepted_at, invited_by)
            VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
            RETURNING id, org_id, user_id, role, invited_at, accepted_at, invited_by
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(UUID.randomUUID(), orgId, userId, role.toDbValue(), invitedBy))
            .map(rowSet -> {
                Row row = rowSet.iterator().next();
                OrgMember member = new OrgMember();
                member.setId(row.getUUID("id"));
                member.setOrgId(row.getUUID("org_id"));
                member.setUserId(row.getUUID("user_id"));
                member.setRole(OrgMember.OrgRole.fromDbValue(row.getString("role")));
                member.setInvitedAt(row.getLocalDateTime("invited_at").toInstant(ZoneOffset.UTC));
                if (row.getLocalDateTime("accepted_at") != null) {
                    member.setAcceptedAt(row.getLocalDateTime("accepted_at").toInstant(ZoneOffset.UTC));
                }
                member.setInvitedBy(row.getUUID("invited_by"));
                return member;
            });
    }

    public Uni<Boolean> updateRole(UUID orgId, UUID userId, OrgMember.OrgRole newRole) {
        String sql = """
            UPDATE org_members SET role = $3
            WHERE org_id = $1 AND user_id = $2
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId, userId, newRole.toDbValue()))
            .map(rowSet -> rowSet.rowCount() > 0);
    }

    public Uni<Boolean> removeMember(UUID orgId, UUID userId) {
        String sql = "DELETE FROM org_members WHERE org_id = $1 AND user_id = $2";
        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId, userId))
            .map(rowSet -> rowSet.rowCount() > 0);
    }

    public Uni<Long> countByOrgId(UUID orgId) {
        String sql = "SELECT COUNT(*) AS cnt FROM org_members WHERE org_id = $1";
        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(rowSet -> rowSet.iterator().next().getLong("cnt"));
    }

    private OrgMember mapRow(Row row) {
        OrgMember member = new OrgMember();
        member.setId(row.getUUID("id"));
        member.setOrgId(row.getUUID("org_id"));
        member.setUserId(row.getUUID("user_id"));
        member.setRole(OrgMember.OrgRole.fromDbValue(row.getString("role")));
        member.setInvitedAt(row.getLocalDateTime("invited_at").toInstant(ZoneOffset.UTC));
        if (row.getLocalDateTime("accepted_at") != null) {
            member.setAcceptedAt(row.getLocalDateTime("accepted_at").toInstant(ZoneOffset.UTC));
        }
        member.setInvitedBy(row.getUUID("invited_by"));
        // Joined fields
        try {
            member.setUserEmail(row.getString("user_email"));
            member.setUserName(row.getString("user_name"));
        } catch (Exception ignored) {
            // Joined fields may not be present in all queries
        }
        return member;
    }
}
