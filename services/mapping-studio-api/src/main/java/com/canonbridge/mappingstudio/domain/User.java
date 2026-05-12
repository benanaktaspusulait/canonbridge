package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public class User {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("tenant_id")
    private String tenantId;

    @JsonProperty("email")
    @NotBlank(message = "email must not be blank")
    @Email(message = "email must be valid")
    private String email;

    @JsonIgnore
    private String passwordHash;

    @JsonProperty("name")
    @NotBlank(message = "name must not be blank")
    private String name;

    @JsonProperty("role")
    private String role;

    @JsonProperty("status")
    private UserStatus status;

    @JsonProperty("last_login_at")
    private Instant lastLoginAt;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public User() {
        this.status = UserStatus.ACTIVE;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }

    public Instant getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(Instant lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public enum UserStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED
    }
}
