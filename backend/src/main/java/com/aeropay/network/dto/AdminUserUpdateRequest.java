package com.aeropay.network.dto;

import com.aeropay.network.model.KycStatus;
import com.aeropay.network.model.Role;

public class AdminUserUpdateRequest {
    private Role role;
    private KycStatus kycStatus;
    private Integer kycTier;
    private Boolean active;
    private Boolean banned;

    public AdminUserUpdateRequest() {}

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public KycStatus getKycStatus() {
        return kycStatus;
    }

    public void setKycStatus(KycStatus kycStatus) {
        this.kycStatus = kycStatus;
    }

    public Integer getKycTier() {
        return kycTier;
    }

    public void setKycTier(Integer kycTier) {
        this.kycTier = kycTier;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getBanned() {
        return banned;
    }

    public void setBanned(Boolean banned) {
        this.banned = banned;
    }
}
