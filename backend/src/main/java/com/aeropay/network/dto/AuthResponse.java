package com.aeropay.network.dto;

import com.aeropay.network.model.Currency;
import com.aeropay.network.model.KycStatus;
import com.aeropay.network.model.Role;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long expiresInMs;
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Role role;
    private KycStatus kycStatus;
    private Integer kycTier;
    private Currency currency;
    private String avatarUrl;
    private String stellarPublicKey;

    public AuthResponse() {}

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Long getExpiresInMs() {
        return expiresInMs;
    }

    public void setExpiresInMs(Long expiresInMs) {
        this.expiresInMs = expiresInMs;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

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

    public Currency getCurrency() {
        return currency;
    }

    public void setCurrency(Currency currency) {
        this.currency = currency;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getStellarPublicKey() {
        return stellarPublicKey;
    }

    public void setStellarPublicKey(String stellarPublicKey) {
        this.stellarPublicKey = stellarPublicKey;
    }
}
