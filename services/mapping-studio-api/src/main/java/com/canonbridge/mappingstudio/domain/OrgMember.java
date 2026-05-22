package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.UUID;

public class OrgMember {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("org_id")
    private UUID orgId;

    @JsonProperty("user_id")
    private UUID userId;

    @JsonProperty("role")
    private OrgRole role;

    @JsonProperty("invited_at")
    private Instant invitedAt;

    @JsonProperty("accepted_at")
    private Instant acceptedAt;

    @JsonProperty("invited_by")
    private UUID invitedBy;

    // Joined fields (from user table, populated in queries)
    @JsonProperty("user_email")
    private String userEmail;

    @JsonProperty("user_name")
    private String userName;

    public OrgMember() {
        this.role = OrgRole.MEMBER;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getOrgId() { return orgId; }
    public void setOrgId(UUID orgId) { this.orgId = orgId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public OrgRole getRole() { return role; }
    public void setRole(OrgRole role) { this.role = role; }

    public Instant getInvitedAt() { return invitedAt; }
    public void setInvitedAt(Instant invitedAt) { this.invitedAt = invitedAt; }

    public Instant getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(Instant acceptedAt) { this.acceptedAt = acceptedAt; }

    public UUID getInvitedBy() { return invitedBy; }
    public void setInvitedBy(UUID invitedBy) { this.invitedBy = invitedBy; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public enum OrgRole {
        OWNER,
        ADMIN,
        MEMBER,
        VIEWER,
        BILLING;

        public String toDbValue() {
            return name().toLowerCase();
        }

        public static OrgRole fromDbValue(String value) {
            return valueOf(value.toUpperCase());
        }
    }
}
