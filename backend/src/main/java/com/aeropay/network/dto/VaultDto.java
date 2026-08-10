package com.aeropay.network.dto;

import com.aeropay.network.model.Currency;
import com.aeropay.network.model.VaultCategory;
import com.aeropay.network.model.VaultStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class VaultDto {
    private Long id;
    private String name;
    private VaultCategory category;
    private Currency currency;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private LocalDate targetDate;
    private BigDecimal autoSaveAmount;
    private String autoSaveFrequency;
    private VaultStatus status;
    private BigDecimal interestRate;
    private double progressPercentage;
    private LocalDateTime createdAt;

    public VaultDto() {}

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

    public VaultCategory getCategory() {
        return category;
    }

    public void setCategory(VaultCategory category) {
        this.category = category;
    }

    public Currency getCurrency() {
        return currency;
    }

    public void setCurrency(Currency currency) {
        this.currency = currency;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = targetAmount;
    }

    public BigDecimal getCurrentAmount() {
        return currentAmount;
    }

    public void setCurrentAmount(BigDecimal currentAmount) {
        this.currentAmount = currentAmount;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public BigDecimal getAutoSaveAmount() {
        return autoSaveAmount;
    }

    public void setAutoSaveAmount(BigDecimal autoSaveAmount) {
        this.autoSaveAmount = autoSaveAmount;
    }

    public String getAutoSaveFrequency() {
        return autoSaveFrequency;
    }

    public void setAutoSaveFrequency(String autoSaveFrequency) {
        this.autoSaveFrequency = autoSaveFrequency;
    }

    public VaultStatus getStatus() {
        return status;
    }

    public void setStatus(VaultStatus status) {
        this.status = status;
    }

    public BigDecimal getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    public double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
