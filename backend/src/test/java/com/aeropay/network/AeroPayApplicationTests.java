package com.aeropay.network;

import com.aeropay.network.service.FxService;
import com.aeropay.network.model.Currency;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:aeropay_test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
class AeroPayApplicationTests {

    @Autowired
    private FxService fxService;

    @Test
    void contextLoads() {
        assertNotNull(fxService);
    }

    @Test
    void testFxRateCalculation() {
        BigDecimal rate = fxService.getExchangeRate(Currency.USD, Currency.RWF);
        assertTrue(rate.compareTo(BigDecimal.ZERO) > 0);
    }
}
