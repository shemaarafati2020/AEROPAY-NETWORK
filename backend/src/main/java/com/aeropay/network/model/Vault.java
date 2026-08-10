package com.aeropay.network.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vaults", indexes = {
    @Index(name = "idx_vaults_user", columnList = "user_id")
})
@EntityListeners(AuditingEntityListener.class)
public class Vault {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VaultCategory category = VaultCategory.GENERAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Currency currency = Currency.RWF;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal targetAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal currentAmount = BigDecimal.ZERO;

    private LocalDate targetDate;

    @Column(precision = 19, scale = 4)
    private BigDecimal autoSaveAmount;

    @Column(length = 20)
    private String autoSaveFrequency; // DAILY, WEEKLY, MONTHLY

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VaultStatus status = VaultStatus.ACTIVE;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate = new BigDecimal("8.50"); // 8.5% annual yield

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Vault() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
