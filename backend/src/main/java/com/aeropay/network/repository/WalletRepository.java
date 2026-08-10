package com.aeropay.network.repository;

import com.aeropay.network.model.Currency;
import com.aeropay.network.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    List<Wallet> findByUserId(Long userId);
    Optional<Wallet> findByUserIdAndCurrency(Long userId, Currency currency);
    Optional<Wallet> findByUserIdAndIsPrimaryTrue(Long userId);
}
