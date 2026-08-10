package com.aeropay.network.controller;

import com.aeropay.network.dto.ApiResponse;
import com.aeropay.network.dto.FxQuoteRequest;
import com.aeropay.network.dto.FxQuoteResponse;
import com.aeropay.network.dto.FxRateDto;
import com.aeropay.network.service.FxService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fx")
@Tag(name = "FX & Exchange Rates", description = "Endpoints for real-time exchange rates and remittance quotes")
public class FxController {

    private final FxService fxService;

    public FxController(FxService fxService) {
        this.fxService = fxService;
    }

    @GetMapping("/rates")
    @Operation(summary = "Get current FX rates and 24h market trends")
    public ResponseEntity<ApiResponse<List<FxRateDto>>> getRates() {
        List<FxRateDto> rates = fxService.getAllRates();
        return ResponseEntity.ok(ApiResponse.ok(rates));
    }

    @PostMapping("/quote")
    @Operation(summary = "Generate guaranteed 60-second exchange quote with fee breakdown")
    public ResponseEntity<ApiResponse<FxQuoteResponse>> getQuote(@Valid @RequestBody FxQuoteRequest request) {
        FxQuoteResponse quote = fxService.getQuote(request);
        return ResponseEntity.ok(ApiResponse.ok("Quote generated", quote));
    }
}
