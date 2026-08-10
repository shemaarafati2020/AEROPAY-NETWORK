package com.aeropay.network.repository;

import com.aeropay.network.model.Vault;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaultRepository extends JpaRepository<Vault, Long> {
    List<Vault> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Vault> findByUserIdAndId(Long userId, Long id);
}
