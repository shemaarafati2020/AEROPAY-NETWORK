package com.aeropay.network.dto;

import com.aeropay.network.model.Currency;
import com.aeropay.network.model.VaultCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateVaultRequest {

    @NotBlank(message = "Vault name is required")
    private String name;

    @NotNull(message = "Category is required")
    private VaultCategory category = VaultCategory.GENERAL;

    @NotNull(message = "Currency is required")
    private Currency currency = Currency.RWF;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "1.0", message = "Target amount must be at least 1.0")
    private BigDecimal targetAmount;

    private BigDecimal initialDeposit = BigDecimal.ZERO;
    private LocalDate targetDate;
    private BigDecimal autoSaveAmount;
    private String autoSaveFrequency; // DAILY, WEEKLY, MONTHLY

    public CreateVaultRequest() {}

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

    public BigDecimal getInitialDeposit() {
        return initialDeposit;
    }

    public void setInitialDeposit(BigDecimal initialDeposit) {
        this.initialDeposit = initialDeposit;
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
}
