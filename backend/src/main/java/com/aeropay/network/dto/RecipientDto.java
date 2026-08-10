package com.aeropay.network.dto;

import com.aeropay.network.model.Currency;
import com.aeropay.network.model.RecipientType;

import java.time.LocalDateTime;

public class RecipientDto {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String accountNumber;
    private String bankOrProvider;
    private RecipientType type;
    private Currency currency;
    private boolean favorite;
    private LocalDateTime createdAt;

    public RecipientDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getBankOrProvider() {
        return bankOrProvider;
    }

    public void setBankOrProvider(String bankOrProvider) {
        this.bankOrProvider = bankOrProvider;
    }

    public RecipientType getType() {
        return type;
    }

    public void setType(RecipientType type) {
        this.type = type;
    }

    public Currency getCurrency() {
        return currency;
    }

    public void setCurrency(Currency currency) {
        this.currency = currency;
    }

    public boolean isFavorite() {
        return favorite;
    }

    public void setFavorite(boolean favorite) {
        this.favorite = favorite;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
