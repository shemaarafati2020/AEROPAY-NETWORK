package com.aeropay.network.service;

import com.aeropay.network.dto.FxQuoteRequest;
import com.aeropay.network.dto.FxQuoteResponse;
import com.aeropay.network.dto.FxRateDto;
import com.aeropay.network.model.Currency;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class FxService {

    // Base rates relative to 1 USD
    private static final Map<Currency, BigDecimal> USD_BASE_RATES = new EnumMap<>(Currency.class);

    static {
        USD_BASE_RATES.put(Currency.USD, new BigDecimal("1.0000"));
        USD_BASE_RATES.put(Currency.EUR, new BigDecimal("0.9250"));
        USD_BASE_RATES.put(Currency.GBP, new BigDecimal("0.7850"));
        USD_BASE_RATES.put(Currency.RWF, new BigDecimal("1425.50"));
        USD_BASE_RATES.put(Currency.KES, new BigDecimal("132.80"));
        USD_BASE_RATES.put(Currency.UGX, new BigDecimal("3780.00"));
        USD_BASE_RATES.put(Currency.NGN, new BigDecimal("1545.00"));
    }

    public List<FxRateDto> getAllRates() {
        List<FxRateDto> rates = new ArrayList<>();
        rates.add(new FxRateDto(Currency.USD, Currency.RWF, USD_BASE_RATES.get(Currency.RWF), new BigDecimal("+0.45")));
        rates.add(new FxRateDto(Currency.USD, Currency.KES, USD_BASE_RATES.get(Currency.KES), new BigDecimal("-0.12")));
        rates.add(new FxRateDto(Currency.USD, Currency.UGX, USD_BASE_RATES.get(Currency.UGX), new BigDecimal("+0.08")));
        rates.add(new FxRateDto(Currency.USD, Currency.NGN, USD_BASE_RATES.get(Currency.NGN), new BigDecimal("+1.20")));
        rates.add(new FxRateDto(Currency.EUR, Currency.RWF, getExchangeRate(Currency.EUR, Currency.RWF), new BigDecimal("+0.22")));
        rates.add(new FxRateDto(Currency.GBP, Currency.RWF, getExchangeRate(Currency.GBP, Currency.RWF), new BigDecimal("+0.35")));
        rates.add(new FxRateDto(Currency.USD, Currency.EUR, USD_BASE_RATES.get(Currency.EUR), new BigDecimal("-0.05")));
        rates.add(new FxRateDto(Currency.USD, Currency.GBP, USD_BASE_RATES.get(Currency.GBP), new BigDecimal("+0.10")));
        return rates;
    }

    public BigDecimal getExchangeRate(Currency source, Currency target) {
        if (source == target) {
            return BigDecimal.ONE;
        }

        BigDecimal sourceToUsdRate = USD_BASE_RATES.get(source);
        BigDecimal targetToUsdRate = USD_BASE_RATES.get(target);

        if (sourceToUsdRate == null || targetToUsdRate == null) {
            return BigDecimal.ONE;
        }

        // rate = targetRate / sourceRate
        return targetToUsdRate.divide(sourceToUsdRate, 6, RoundingMode.HALF_UP);
    }

    public FxQuoteResponse getQuote(FxQuoteRequest request) {
        BigDecimal rate = getExchangeRate(request.getSourceCurrency(), request.getTargetCurrency());
        BigDecimal targetAmount = request.getAmount().multiply(rate).setScale(4, RoundingMode.HALF_UP);

        // 0.3% Flat Network Fee
        BigDecimal feePercentage = new BigDecimal("0.003");
        BigDecimal fee = request.getAmount().multiply(feePercentage).setScale(4, RoundingMode.HALF_UP);
        BigDecimal totalDebited = request.getAmount().add(fee).setScale(4, RoundingMode.HALF_UP);

        FxQuoteResponse response = new FxQuoteResponse();
        response.setSourceCurrency(request.getSourceCurrency());
        response.setTargetCurrency(request.getTargetCurrency());
        response.setSourceAmount(request.getAmount());
        response.setTargetAmount(targetAmount);
        response.setExchangeRate(rate);
        response.setFee(fee);
        response.setTotalDebited(totalDebited);
        response.setQuoteExpiresInSeconds(60);
        return response;
    }
}
