package com.aeropay.network.controller;

import com.aeropay.network.dto.ApiResponse;
import com.aeropay.network.dto.FundWalletRequest;
import com.aeropay.network.dto.WalletDto;
import com.aeropay.network.model.Currency;
import com.aeropay.network.security.UserPrincipal;
import com.aeropay.network.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
@Tag(name = "Wallets & Balances", description = "Endpoints for managing multi-currency balances and funding")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    @Operation(summary = "Get all multi-currency wallets for current user")
    public ResponseEntity<ApiResponse<List<WalletDto>>> getWallets(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<WalletDto> wallets = walletService.getWalletsForUser(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(wallets));
    }

    @GetMapping("/{currency}")
    @Operation(summary = "Get specific currency wallet for current user")
    public ResponseEntity<ApiResponse<WalletDto>> getWallet(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Currency currency) {
        WalletDto wallet = walletService.getWallet(userPrincipal.getId(), currency);
        return ResponseEntity.ok(ApiResponse.ok(wallet));
    }

    @PostMapping("/fund")
    @Operation(summary = "Top up or fund a wallet with mobile money, card, or Stellar")
    public ResponseEntity<ApiResponse<WalletDto>> fundWallet(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody FundWalletRequest request) {
        WalletDto wallet = walletService.fundWallet(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Wallet funded successfully", wallet));
    }
}
