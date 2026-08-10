package com.aeropay.network.service;

import com.aeropay.network.dto.*;
import com.aeropay.network.exception.ResourceNotFoundException;
import com.aeropay.network.model.AuditLog;
import com.aeropay.network.model.Role;
import com.aeropay.network.model.User;
import com.aeropay.network.repository.AuditLogRepository;
import com.aeropay.network.repository.TransactionRepository;
import com.aeropay.network.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuthService authService;
    private final TransactionService transactionService;

    public AdminService(UserRepository userRepository,
                        TransactionRepository transactionRepository,
                        AuditLogRepository auditLogRepository,
                        AuthService authService,
                        TransactionService transactionService) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.auditLogRepository = auditLogRepository;
        this.authService = authService;
        this.transactionService = transactionService;
    }

    @Transactional(readOnly = true)
    public AdminStatsDto getSystemStats() {
        AdminStatsDto dto = new AdminStatsDto();
        dto.setTotalUsers(userRepository.count());
        dto.setActiveUsers(userRepository.countByActive(true));
        dto.setTotalTransactions(transactionRepository.count());
        dto.setTotalVolume(transactionRepository.sumTotalCompletedVolume());
        dto.setTotalRevenueFees(transactionRepository.sumTotalCollectedFees());

        LocalDateTime since24h = LocalDateTime.now().minusHours(24);
        dto.setLast24hTransactions(transactionRepository.countRecentTransactions(since24h));
        dto.setLast24hVolume(transactionRepository.sumRecentCompletedVolume(since24h));
        dto.setSystemHealthScore(99.98);
        dto.setStellarNetworkStatus("OPERATIONAL (Testnet Horizon)");
        return dto;
    }

    @Transactional(readOnly = true)
    public Page<UserProfileDto> getAllUsers(String search, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return userRepository.searchUsers(search.trim(), pageable)
                    .map(authService::mapToUserProfileDto);
        }
        return userRepository.findAll(pageable)
                .map(authService::mapToUserProfileDto);
    }

    @Transactional
    public UserProfileDto updateUser(Long adminId, Long userId, AdminUserUpdateRequest request, String ipAddress) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        StringBuilder auditDetails = new StringBuilder("Admin updated user " + user.getEmail() + ": ");

        if (request.getRole() != null) {
            auditDetails.append("Role changed from ").append(user.getRole()).append(" to ").append(request.getRole()).append("; ");
            user.setRole(request.getRole());
        }
        if (request.getKycStatus() != null) {
            auditDetails.append("KYC changed from ").append(user.getKycStatus()).append(" to ").append(request.getKycStatus()).append("; ");
            user.setKycStatus(request.getKycStatus());
        }
        if (request.getKycTier() != null) {
            user.setKycTier(request.getKycTier());
        }
        if (request.getActive() != null) {
            auditDetails.append("Active status changed to ").append(request.getActive()).append("; ");
            user.setActive(request.getActive());
        }
        if (request.getBanned() != null) {
            auditDetails.append("Banned status changed to ").append(request.getBanned()).append("; ");
            user.setBanned(request.getBanned());
        }

        User updated = userRepository.save(user);
        logAudit(admin, "USER_UPDATE", "USER", String.valueOf(userId), auditDetails.toString(), ipAddress);

        return authService.mapToUserProfileDto(updated);
    }

    @Transactional(readOnly = true)
    public Page<TransactionDto> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable)
                .map(transactionService::mapToTransactionDto);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToAuditLogDto);
    }

    @Transactional
    public void logAudit(User admin, String action, String targetType, String targetId, String details, String ipAddress) {
        AuditLog log = new AuditLog(admin, action, targetType, targetId, details, ipAddress);
        auditLogRepository.save(log);
    }

    public AuditLogDto mapToAuditLogDto(AuditLog log) {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(log.getId());
        if (log.getAdmin() != null) {
            dto.setAdminId(log.getAdmin().getId());
            dto.setAdminEmail(log.getAdmin().getEmail());
            dto.setAdminName(log.getAdmin().getFullName());
        }
        dto.setAction(log.getAction());
        dto.setTargetType(log.getTargetType());
        dto.setTargetId(log.getTargetId());
        dto.setDetails(log.getDetails());
        dto.setIpAddress(log.getIpAddress());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}
