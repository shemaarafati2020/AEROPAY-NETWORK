package com.aeropay.network.dto;

import com.aeropay.network.model.Currency;
import com.aeropay.network.model.RecipientType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateRecipientRequest {

    @NotBlank(message = "Recipient name is required")
    private String name;

    private String phone;
    private String email;
    private String accountNumber;
    private String bankOrProvider;

    @NotNull(message = "Recipient type is required")
    private RecipientType type = RecipientType.MOMO;

    @NotNull(message = "Currency is required")
    private Currency currency = Currency.RWF;

    private boolean favorite = false;

    public CreateRecipientRequest() {}

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
}
