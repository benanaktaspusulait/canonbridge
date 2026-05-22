package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.Plan;
import com.canonbridge.mappingstudio.domain.PlanFeature;
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
public class PlanRepository {

    @Inject
    PgPool client;

    public Uni<List<Plan>> findAllPublic() {
        String sql = """
            SELECT id, code, name, description, price_monthly_cents, price_yearly_cents,
                   currency, is_public, sort_order, created_at, updated_at
            FROM plans
            WHERE is_public = TRUE
            ORDER BY sort_order
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.tuple())
            .map(rowSet -> {
                List<Plan> plans = new ArrayList<>();
                for (Row row : rowSet) {
                    plans.add(mapPlanRow(row));
                }
                return plans;
            });
    }

    public Uni<Plan> findByCode(String code) {
        String sql = """
            SELECT id, code, name, description, price_monthly_cents, price_yearly_cents,
                   currency, is_public, sort_order, created_at, updated_at
            FROM plans
            WHERE code = $1
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(code))
            .map(rowSet -> {
                if (rowSet.size() == 0) return null;
                return mapPlanRow(rowSet.iterator().next());
            });
    }

    public Uni<Plan> findById(UUID id) {
        String sql = """
            SELECT id, code, name, description, price_monthly_cents, price_yearly_cents,
                   currency, is_public, sort_order, created_at, updated_at
            FROM plans
            WHERE id = $1
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(id))
            .map(rowSet -> {
                if (rowSet.size() == 0) return null;
                return mapPlanRow(rowSet.iterator().next());
            });
    }

    public Uni<List<PlanFeature>> findFeaturesByPlanId(UUID planId) {
        String sql = """
            SELECT id, plan_id, feature_key, limit_value, unit, is_soft_limit, description
            FROM plan_features
            WHERE plan_id = $1
            ORDER BY feature_key
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(planId))
            .map(rowSet -> {
                List<PlanFeature> features = new ArrayList<>();
                for (Row row : rowSet) {
                    features.add(mapFeatureRow(row));
                }
                return features;
            });
    }

    public Uni<List<PlanFeature>> findFeaturesByPlanCode(String planCode) {
        String sql = """
            SELECT pf.id, pf.plan_id, pf.feature_key, pf.limit_value, pf.unit, pf.is_soft_limit, pf.description
            FROM plan_features pf
            JOIN plans p ON p.id = pf.plan_id
            WHERE p.code = $1
            ORDER BY pf.feature_key
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(planCode))
            .map(rowSet -> {
                List<PlanFeature> features = new ArrayList<>();
                for (Row row : rowSet) {
                    features.add(mapFeatureRow(row));
                }
                return features;
            });
    }

    private Plan mapPlanRow(Row row) {
        Plan plan = new Plan();
        plan.setId(row.getUUID("id"));
        plan.setCode(row.getString("code"));
        plan.setName(row.getString("name"));
        plan.setDescription(row.getString("description"));
        plan.setPriceMonthly(row.getInteger("price_monthly_cents"));
        plan.setPriceYearly(row.getInteger("price_yearly_cents"));
        plan.setCurrency(row.getString("currency"));
        plan.setPublic(row.getBoolean("is_public"));
        plan.setSortOrder(row.getInteger("sort_order"));
        plan.setCreatedAt(row.getLocalDateTime("created_at").toInstant(ZoneOffset.UTC));
        plan.setUpdatedAt(row.getLocalDateTime("updated_at").toInstant(ZoneOffset.UTC));
        return plan;
    }

    private PlanFeature mapFeatureRow(Row row) {
        PlanFeature feature = new PlanFeature();
        feature.setId(row.getUUID("id"));
        feature.setPlanId(row.getUUID("plan_id"));
        feature.setFeatureKey(row.getString("feature_key"));
        feature.setLimitValue(row.getLong("limit_value"));
        feature.setUnit(row.getString("unit"));
        feature.setSoftLimit(row.getBoolean("is_soft_limit"));
        feature.setDescription(row.getString("description"));
        return feature;
    }
}
