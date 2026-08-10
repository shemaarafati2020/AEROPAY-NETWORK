package com.aeropay.network.controller;

import com.aeropay.network.dto.ApiResponse;
import com.aeropay.network.dto.SendMoneyRequest;
import com.aeropay.network.dto.TransactionDto;
import com.aeropay.network.security.UserPrincipal;
import com.aeropay.network.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@Tag(name = "Transactions & Transfers", description = "Endpoints for sending money and querying transaction history")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    @Operation(summary = "Get transaction history for current user")
    public ResponseEntity<ApiResponse<List<TransactionDto>>> getTransactions(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<TransactionDto> transactions = transactionService.getTransactionsForUser(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(transactions));
    }

    @GetMapping("/{referenceId}")
    @Operation(summary = "Get specific transaction details by reference ID")
    public ResponseEntity<ApiResponse<TransactionDto>> getTransaction(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String referenceId) {
        TransactionDto tx = transactionService.getTransactionByReference(referenceId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(tx));
    }

    @PostMapping("/send")
    @Operation(summary = "Initiate instant cross-border remittance or domestic transfer")
    public ResponseEntity<ApiResponse<TransactionDto>> sendMoney(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SendMoneyRequest request) {
        TransactionDto tx = transactionService.sendMoney(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Transfer initiated and settled successfully", tx));
    }
}
