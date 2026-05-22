package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public class Organization {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("tenant_id")
    private String tenantId;

    @JsonProperty("name")
    @NotBlank(message = "name must not be blank")
    @Size(max = 255)
    private String name;

    @JsonProperty("slug")
    @NotBlank(message = "slug must not be blank")
    @Pattern(regexp = "^[a-z0-9][a-z0-9-]{1,98}[a-z0-9]$", message = "slug must be lowercase alphanumeric with hyphens")
    @Size(min = 3, max = 100)
    private String slug;

    @JsonProperty("owner_user_id")
    private UUID ownerUserId;

    @JsonProperty("billing_email")
    private String billingEmail;

    @JsonProperty("country")
    private String country;

    @JsonProperty("vat_id")
    private String vatId;

    @JsonProperty("status")
    private OrgStatus status;

    @JsonProperty("metadata")
    private String metadata;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public Organization() {
        this.status = OrgStatus.ACTIVE;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public UUID getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(UUID ownerUserId) { this.ownerUserId = ownerUserId; }

    public String getBillingEmail() { return billingEmail; }
    public void setBillingEmail(String billingEmail) { this.billingEmail = billingEmail; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getVatId() { return vatId; }
    public void setVatId(String vatId) { this.vatId = vatId; }

    public OrgStatus getStatus() { return status; }
    public void setStatus(OrgStatus status) { this.status = status; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public enum OrgStatus {
        ACTIVE,
        SUSPENDED,
        ARCHIVED
    }
}
