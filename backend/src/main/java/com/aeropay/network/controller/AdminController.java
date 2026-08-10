package com.aeropay.network.controller;

import com.aeropay.network.dto.*;
import com.aeropay.network.security.UserPrincipal;
import com.aeropay.network.service.AdminService;
import com.aeropay.network.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Operations", description = "Endpoints for platform governance, monitoring, and audit trails")
public class AdminController {

    private final AdminService adminService;
    private final NotificationService notificationService;

    public AdminController(AdminService adminService, NotificationService notificationService) {
        this.adminService = adminService;
        this.notificationService = notificationService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get high-level platform statistics and KPIs")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats() {
        AdminStatsDto stats = adminService.getSystemStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/users")
    @Operation(summary = "Search and list all platform users with pagination")
    public ResponseEntity<ApiResponse<Page<UserProfileDto>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserProfileDto> users = adminService.getAllUsers(search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PatchMapping("/users/{id}")
    @Operation(summary = "Update user role, KYC status, or active/ban flags")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateUser(
            @AuthenticationPrincipal UserPrincipal adminPrincipal,
            @PathVariable Long id,
            @RequestBody AdminUserUpdateRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        UserProfileDto updated = adminService.updateUser(adminPrincipal.getId(), id, request, clientIp);
        return ResponseEntity.ok(ApiResponse.ok("User updated successfully", updated));
    }

    @GetMapping("/transactions")
    @Operation(summary = "Query all global transactions across the network")
    public ResponseEntity<ApiResponse<Page<TransactionDto>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TransactionDto> transactions = adminService.getAllTransactions(pageable);
        return ResponseEntity.ok(ApiResponse.ok(transactions));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Query administrative audit logs and trace events")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AuditLogDto> logs = adminService.getAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @PostMapping("/broadcast")
    @Operation(summary = "Broadcast a notification to all users or specific roles")
    public ResponseEntity<ApiResponse<String>> broadcastNotification(
            @Valid @RequestBody BroadcastNotificationRequest request) {
        long count = notificationService.broadcastNotification(request);
        return ResponseEntity.ok(ApiResponse.ok("Broadcast delivered to " + count + " recipient(s)", "Sent: " + count));
    }
}
