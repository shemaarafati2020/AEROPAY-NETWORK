package com.aeropay.network.controller;

import com.aeropay.network.dto.ApiResponse;
import com.aeropay.network.dto.CreateVaultRequest;
import com.aeropay.network.dto.VaultDepositWithdrawRequest;
import com.aeropay.network.dto.VaultDto;
import com.aeropay.network.security.UserPrincipal;
import com.aeropay.network.service.VaultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vaults")
@Tag(name = "Savings Vaults", description = "Endpoints for target-based savings and high-yield vaults")
public class VaultController {

    private final VaultService vaultService;

    public VaultController(VaultService vaultService) {
        this.vaultService = vaultService;
    }

    @GetMapping
    @Operation(summary = "Get all savings vaults for current user")
    public ResponseEntity<ApiResponse<List<VaultDto>>> getVaults(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<VaultDto> vaults = vaultService.getVaultsForUser(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(vaults));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vault details by ID")
    public ResponseEntity<ApiResponse<VaultDto>> getVault(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        VaultDto vault = vaultService.getVault(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok(vault));
    }

    @PostMapping
    @Operation(summary = "Create a new target savings vault")
    public ResponseEntity<ApiResponse<VaultDto>> createVault(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateVaultRequest request) {
        VaultDto vault = vaultService.createVault(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Vault created successfully", vault));
    }

    @PostMapping("/{id}/deposit")
    @Operation(summary = "Deposit funds into savings vault")
    public ResponseEntity<ApiResponse<VaultDto>> deposit(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody VaultDepositWithdrawRequest request) {
        VaultDto vault = vaultService.depositToVault(userPrincipal.getId(), id, request.getAmount());
        return ResponseEntity.ok(ApiResponse.ok("Funds added to vault", vault));
    }

    @PostMapping("/{id}/withdraw")
    @Operation(summary = "Withdraw funds from savings vault back into main balance")
    public ResponseEntity<ApiResponse<VaultDto>> withdraw(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody VaultDepositWithdrawRequest request) {
        VaultDto vault = vaultService.withdrawFromVault(userPrincipal.getId(), id, request.getAmount());
        return ResponseEntity.ok(ApiResponse.ok("Funds withdrawn from vault", vault));
    }
}
