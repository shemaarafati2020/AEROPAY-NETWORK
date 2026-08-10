package com.aeropay.network.dto;

import com.aeropay.network.model.Currency;

import java.math.BigDecimal;

public class FxQuoteResponse {
    private Currency sourceCurrency;
    private Currency targetCurrency;
    private BigDecimal sourceAmount;
    private BigDecimal targetAmount;
    private BigDecimal exchangeRate;
    private BigDecimal fee;
    private BigDecimal totalDebited;
    private long quoteExpiresInSeconds = 60;

    public FxQuoteResponse() {}

    public Currency getSourceCurrency() {
        return sourceCurrency;
    }

    public void setSourceCurrency(Currency sourceCurrency) {
        this.sourceCurrency = sourceCurrency;
    }

    public Currency getTargetCurrency() {
        return targetCurrency;
    }

    public void setTargetCurrency(Currency targetCurrency) {
        this.targetCurrency = targetCurrency;
    }

    public BigDecimal getSourceAmount() {
        return sourceAmount;
    }

    public void setSourceAmount(BigDecimal sourceAmount) {
        this.sourceAmount = sourceAmount;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = targetAmount;
    }

    public BigDecimal getExchangeRate() {
        return exchangeRate;
    }

    public void setExchangeRate(BigDecimal exchangeRate) {
        this.exchangeRate = exchangeRate;
    }

    public BigDecimal getFee() {
        return fee;
    }

    public void setFee(BigDecimal fee) {
        this.fee = fee;
    }

    public BigDecimal getTotalDebited() {
        return totalDebited;
    }

    public void setTotalDebited(BigDecimal totalDebited) {
        this.totalDebited = totalDebited;
    }

    public long getQuoteExpiresInSeconds() {
        return quoteExpiresInSeconds;
    }

    public void setQuoteExpiresInSeconds(long quoteExpiresInSeconds) {
        this.quoteExpiresInSeconds = quoteExpiresInSeconds;
    }
}
