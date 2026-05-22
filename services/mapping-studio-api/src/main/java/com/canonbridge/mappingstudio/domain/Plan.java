package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class Plan {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("code")
    private String code;

    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("price_monthly_cents")
    private int priceMonthly;

    @JsonProperty("price_yearly_cents")
    private int priceYearly;

    @JsonProperty("currency")
    private String currency;

    @JsonProperty("is_public")
    private boolean isPublic;

    @JsonProperty("sort_order")
    private int sortOrder;

    @JsonProperty("features")
    private List<PlanFeature> features;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public Plan() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getPriceMonthly() { return priceMonthly; }
    public void setPriceMonthly(int priceMonthly) { this.priceMonthly = priceMonthly; }

    public int getPriceYearly() { return priceYearly; }
    public void setPriceYearly(int priceYearly) { this.priceYearly = priceYearly; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public List<PlanFeature> getFeatures() { return features; }
    public void setFeatures(List<PlanFeature> features) { this.features = features; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
