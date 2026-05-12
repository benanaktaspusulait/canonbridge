package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.User;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@ApplicationScoped
public class UserRepository {

    @Inject
    PgPool client;

    public Uni<User> findByEmail(String email) {
        String sql = """
            SELECT id, tenant_id, email, password_hash, name, role, status, 
                   last_login_at, created_at, updated_at
            FROM users
            WHERE email = $1 AND status = 'ACTIVE'
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(email))
            .map(rowSet -> {
                if (rowSet.size() == 0) {
                    return null;
                }
                return mapRow(rowSet.iterator().next());
            });
    }

    public Uni<User> findById(UUID id) {
        String sql = """
            SELECT id, tenant_id, email, password_hash, name, role, status, 
                   last_login_at, created_at, updated_at
            FROM users
            WHERE id = $1
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(id))
            .map(rowSet -> {
                if (rowSet.size() == 0) {
                    return null;
                }
                return mapRow(rowSet.iterator().next());
            });
    }

    public Uni<Void> updateLastLogin(UUID userId) {
        String sql = """
            UPDATE users
            SET last_login_at = $1
            WHERE id = $2
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(Instant.now(), userId))
            .replaceWithVoid();
    }

    private User mapRow(Row row) {
        User user = new User();
        user.setId(row.getUUID("id"));
        user.setTenantId(row.getString("tenant_id"));
        user.setEmail(row.getString("email"));
        user.setPasswordHash(row.getString("password_hash"));
        user.setName(row.getString("name"));
        user.setRole(row.getString("role"));
        user.setStatus(User.UserStatus.valueOf(row.getString("status")));
        
        if (row.getLocalDateTime("last_login_at") != null) {
            user.setLastLoginAt(row.getLocalDateTime("last_login_at").toInstant(ZoneOffset.UTC));
        }
        
        user.setCreatedAt(row.getLocalDateTime("created_at").toInstant(ZoneOffset.UTC));
        user.setUpdatedAt(row.getLocalDateTime("updated_at").toInstant(ZoneOffset.UTC));
        
        return user;
    }
}
