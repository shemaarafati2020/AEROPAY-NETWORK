package com.aeropay.network.repository;

import com.aeropay.network.model.Transaction;
import com.aeropay.network.model.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Optional<Transaction> findByReferenceId(String referenceId);
    long countByStatus(TransactionStatus status);

    @Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM Transaction t WHERE t.status = 'COMPLETED'")
    BigDecimal sumTotalCompletedVolume();

    @Query("SELECT COALESCE(SUM(t.fee), 0) FROM Transaction t WHERE t.status = 'COMPLETED'")
    BigDecimal sumTotalCollectedFees();

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.createdAt >= :since")
    long countRecentTransactions(LocalDateTime since);

    @Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM Transaction t WHERE t.status = 'COMPLETED' AND t.createdAt >= :since")
    BigDecimal sumRecentCompletedVolume(LocalDateTime since);
}
