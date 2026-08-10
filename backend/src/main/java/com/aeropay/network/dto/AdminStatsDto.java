package com.aeropay.network.dto;

import java.math.BigDecimal;

public class AdminStatsDto {
    private long totalUsers;
    private long activeUsers;
    private long totalTransactions;
    private BigDecimal totalVolume;
    private BigDecimal totalRevenueFees;
    private long last24hTransactions;
    private BigDecimal last24hVolume;
    private double systemHealthScore;
    private String stellarNetworkStatus;

    public AdminStatsDto() {}

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public BigDecimal getTotalVolume() {
        return totalVolume;
    }

    public void setTotalVolume(BigDecimal totalVolume) {
        this.totalVolume = totalVolume;
    }

    public BigDecimal getTotalRevenueFees() {
        return totalRevenueFees;
    }

    public void setTotalRevenueFees(BigDecimal totalRevenueFees) {
        this.totalRevenueFees = totalRevenueFees;
    }

    public long getLast24hTransactions() {
        return last24hTransactions;
    }

    public void setLast24hTransactions(long last24hTransactions) {
        this.last24hTransactions = last24hTransactions;
    }

    public BigDecimal getLast24hVolume() {
        return last24hVolume;
    }

    public void setLast24hVolume(BigDecimal last24hVolume) {
        this.last24hVolume = last24hVolume;
    }

    public double getSystemHealthScore() {
        return systemHealthScore;
    }

    public void setSystemHealthScore(double systemHealthScore) {
        this.systemHealthScore = systemHealthScore;
    }

    public String getStellarNetworkStatus() {
        return stellarNetworkStatus;
    }

    public void setStellarNetworkStatus(String stellarNetworkStatus) {
        this.stellarNetworkStatus = stellarNetworkStatus;
    }
}
