package com.aeropay.network.service;

import com.aeropay.network.dto.FundWalletRequest;
import com.aeropay.network.dto.WalletDto;
import com.aeropay.network.exception.BadRequestException;
import com.aeropay.network.exception.InsufficientBalanceException;
import com.aeropay.network.exception.ResourceNotFoundException;
import com.aeropay.network.model.*;
import com.aeropay.network.repository.TransactionRepository;
import com.aeropay.network.repository.UserRepository;
import com.aeropay.network.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public WalletService(WalletRepository walletRepository,
                         UserRepository userRepository,
                         TransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public void initializeDefaultWallets(User user) {
        // Create primary wallet
        Wallet primaryWallet = new Wallet(user, user.getCurrency(), BigDecimal.ZERO, true);
        walletRepository.save(primaryWallet);

        // Create secondary wallets if not primary
        for (Currency currency : Currency.values()) {
            if (currency != user.getCurrency()) {
                Wallet secondary = new Wallet(user, currency, BigDecimal.ZERO, false);
                walletRepository.save(secondary);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<WalletDto> getWalletsForUser(Long userId) {
        return walletRepository.findByUserId(userId).stream()
                .map(this::mapToWalletDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WalletDto getWallet(Long userId, Currency currency) {
        Wallet wallet = walletRepository.findByUserIdAndCurrency(userId, currency)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for currency: " + currency));
        return mapToWalletDto(wallet);
    }

    @Transactional
    public WalletDto fundWallet(Long userId, FundWalletRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Wallet wallet = walletRepository.findByUserIdAndCurrency(userId, request.getCurrency())
                .orElseGet(() -> {
                    Wallet newWallet = new Wallet(user, request.getCurrency(), BigDecimal.ZERO, false);
                    return walletRepository.save(newWallet);
                });

        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        Wallet savedWallet = walletRepository.save(wallet);

        // Record Deposit Transaction
        Transaction tx = new Transaction();
        tx.setReferenceId("DEP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        tx.setUser(user);
        tx.setType(TransactionType.TOPUP);
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setRecipientType(RecipientType.MOMO);
        tx.setRecipientName("Self Deposit (" + (request.getPaymentMethod() != null ? request.getPaymentMethod() : "Instant") + ")");
        tx.setRecipientPhone(request.getPhoneNumber());
        tx.setAmount(request.getAmount());
        tx.setSourceCurrency(request.getCurrency());
        tx.setTargetCurrency(request.getCurrency());
        tx.setExchangeRate(BigDecimal.ONE);
        tx.setFee(BigDecimal.ZERO);
        tx.setTotalAmount(request.getAmount());
        tx.setDescription("Wallet Top-Up via " + (request.getPaymentMethod() != null ? request.getPaymentMethod() : "Payment Gateway"));
        transactionRepository.save(tx);

        return mapToWalletDto(savedWallet);
    }

    @Transactional
    public Wallet debitWallet(Long userId, Currency currency, BigDecimal amount) {
        Wallet wallet = walletRepository.findByUserIdAndCurrency(userId, currency)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for currency: " + currency));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient funds. Available: " + wallet.getBalance() + " " + currency);
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        return walletRepository.save(wallet);
    }

    @Transactional
    public Wallet creditWallet(Long userId, Currency currency, BigDecimal amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Wallet wallet = walletRepository.findByUserIdAndCurrency(userId, currency)
                .orElseGet(() -> {
                    Wallet newWallet = new Wallet(user, currency, BigDecimal.ZERO, false);
                    return walletRepository.save(newWallet);
                });

        wallet.setBalance(wallet.getBalance().add(amount));
        return walletRepository.save(wallet);
    }

    public WalletDto mapToWalletDto(Wallet wallet) {
        WalletDto dto = new WalletDto();
        dto.setId(wallet.getId());
        dto.setCurrency(wallet.getCurrency());
        dto.setBalance(wallet.getBalance());
        dto.setLockedBalance(wallet.getLockedBalance());
        dto.setPrimary(wallet.isPrimary());
        return dto;
    }
}
