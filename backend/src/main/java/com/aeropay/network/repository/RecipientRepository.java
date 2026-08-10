package com.aeropay.network.repository;

import com.aeropay.network.model.Recipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipientRepository extends JpaRepository<Recipient, Long> {
    List<Recipient> findByUserIdOrderByFavoriteDescCreatedAtDesc(Long userId);
    Optional<Recipient> findByUserIdAndId(Long userId, Long id);
}
