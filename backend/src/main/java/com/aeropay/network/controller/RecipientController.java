package com.aeropay.network.controller;

import com.aeropay.network.dto.ApiResponse;
import com.aeropay.network.dto.CreateRecipientRequest;
import com.aeropay.network.dto.RecipientDto;
import com.aeropay.network.security.UserPrincipal;
import com.aeropay.network.service.RecipientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipients")
@Tag(name = "Beneficiaries & Contacts", description = "Endpoints for managing saved recipients and favorites")
public class RecipientController {

    private final RecipientService recipientService;

    public RecipientController(RecipientService recipientService) {
        this.recipientService = recipientService;
    }

    @GetMapping
    @Operation(summary = "List saved beneficiaries for current user")
    public ResponseEntity<ApiResponse<List<RecipientDto>>> getRecipients(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<RecipientDto> recipients = recipientService.getRecipientsForUser(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(recipients));
    }

    @PostMapping
    @Operation(summary = "Save a new recipient")
    public ResponseEntity<ApiResponse<RecipientDto>> createRecipient(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateRecipientRequest request) {
        RecipientDto recipient = recipientService.createRecipient(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Recipient saved successfully", recipient));
    }

    @PatchMapping("/{id}/favorite")
    @Operation(summary = "Toggle favorite status for a recipient")
    public ResponseEntity<ApiResponse<RecipientDto>> toggleFavorite(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        RecipientDto recipient = recipientService.toggleFavorite(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Favorite updated", recipient));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a saved recipient")
    public ResponseEntity<ApiResponse<Void>> deleteRecipient(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        recipientService.deleteRecipient(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Recipient removed", null));
    }
}
