package com.aeropay.network.service;

import com.aeropay.network.dto.CreateVaultRequest;
import com.aeropay.network.dto.VaultDto;
import com.aeropay.network.exception.BadRequestException;
import com.aeropay.network.exception.InsufficientBalanceException;
import com.aeropay.network.exception.ResourceNotFoundException;
import com.aeropay.network.model.User;
import com.aeropay.network.model.Vault;
import com.aeropay.network.model.VaultStatus;
import com.aeropay.network.repository.UserRepository;
import com.aeropay.network.repository.VaultRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VaultService {

    private final VaultRepository vaultRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;

    public VaultService(VaultRepository vaultRepository, UserRepository userRepository, WalletService walletService) {
        this.vaultRepository = vaultRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
    }

    @Transactional(readOnly = true)
    public List<VaultDto> getVaultsForUser(Long userId) {
        return vaultRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToVaultDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VaultDto getVault(Long userId, Long vaultId) {
        Vault vault = vaultRepository.findByUserIdAndId(userId, vaultId)
                .orElseThrow(() -> new ResourceNotFoundException("Vault not found"));
        return mapToVaultDto(vault);
    }

    @Transactional
    public VaultDto createVault(Long userId, CreateVaultRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Vault vault = new Vault();
        vault.setUser(user);
        vault.setName(request.getName().trim());
        vault.setCategory(request.getCategory());
        vault.setCurrency(request.getCurrency());
        vault.setTargetAmount(request.getTargetAmount());
        vault.setTargetDate(request.getTargetDate());
        vault.setAutoSaveAmount(request.getAutoSaveAmount());
        vault.setAutoSaveFrequency(request.getAutoSaveFrequency());
        vault.setStatus(VaultStatus.ACTIVE);
        vault.setInterestRate(new BigDecimal("8.50"));

        BigDecimal initialDeposit = request.getInitialDeposit() != null ? request.getInitialDeposit() : BigDecimal.ZERO;
        if (initialDeposit.compareTo(BigDecimal.ZERO) > 0) {
            walletService.debitWallet(userId, request.getCurrency(), initialDeposit);
            vault.setCurrentAmount(initialDeposit);
        } else {
            vault.setCurrentAmount(BigDecimal.ZERO);
        }

        Vault saved = vaultRepository.save(vault);
        return mapToVaultDto(saved);
    }

    @Transactional
    public VaultDto depositToVault(Long userId, Long vaultId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Deposit amount must be positive");
        }

        Vault vault = vaultRepository.findByUserIdAndId(userId, vaultId)
                .orElseThrow(() -> new ResourceNotFoundException("Vault not found"));

        if (vault.getStatus() == VaultStatus.LOCKED) {
            throw new BadRequestException("Vault is currently locked");
        }

        // Debit user wallet
        walletService.debitWallet(userId, vault.getCurrency(), amount);

        vault.setCurrentAmount(vault.getCurrentAmount().add(amount));
        if (vault.getCurrentAmount().compareTo(vault.getTargetAmount()) >= 0) {
            vault.setStatus(VaultStatus.COMPLETED);
        }

        Vault updated = vaultRepository.save(vault);
        return mapToVaultDto(updated);
    }

    @Transactional
    public VaultDto withdrawFromVault(Long userId, Long vaultId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Withdrawal amount must be positive");
        }

        Vault vault = vaultRepository.findByUserIdAndId(userId, vaultId)
                .orElseThrow(() -> new ResourceNotFoundException("Vault not found"));

        if (vault.getCurrentAmount().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient vault balance. Available: " + vault.getCurrentAmount());
        }

        vault.setCurrentAmount(vault.getCurrentAmount().subtract(amount));
        if (vault.getStatus() == VaultStatus.COMPLETED && vault.getCurrentAmount().compareTo(vault.getTargetAmount()) < 0) {
            vault.setStatus(VaultStatus.ACTIVE);
        }

        // Credit user wallet
        walletService.creditWallet(userId, vault.getCurrency(), amount);

        Vault updated = vaultRepository.save(vault);
        return mapToVaultDto(updated);
    }

    public VaultDto mapToVaultDto(Vault v) {
        VaultDto dto = new VaultDto();
        dto.setId(v.getId());
        dto.setName(v.getName());
        dto.setCategory(v.getCategory());
        dto.setCurrency(v.getCurrency());
        dto.setTargetAmount(v.getTargetAmount());
        dto.setCurrentAmount(v.getCurrentAmount());
        dto.setTargetDate(v.getTargetDate());
        dto.setAutoSaveAmount(v.getAutoSaveAmount());
        dto.setAutoSaveFrequency(v.getAutoSaveFrequency());
        dto.setStatus(v.getStatus());
        dto.setInterestRate(v.getInterestRate());
        dto.setCreatedAt(v.getCreatedAt());

        if (v.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            double progress = v.getCurrentAmount()
                    .divide(v.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .doubleValue() * 100;
            dto.setProgressPercentage(Math.min(100.0, Math.round(progress * 10.0) / 10.0));
        } else {
            dto.setProgressPercentage(0.0);
        }

        return dto;
    }
}
