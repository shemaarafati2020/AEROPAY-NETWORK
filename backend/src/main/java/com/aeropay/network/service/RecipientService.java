package com.aeropay.network.service;

import com.aeropay.network.dto.CreateRecipientRequest;
import com.aeropay.network.dto.RecipientDto;
import com.aeropay.network.exception.ResourceNotFoundException;
import com.aeropay.network.model.Recipient;
import com.aeropay.network.model.User;
import com.aeropay.network.repository.RecipientRepository;
import com.aeropay.network.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecipientService {

    private final RecipientRepository recipientRepository;
    private final UserRepository userRepository;

    public RecipientService(RecipientRepository recipientRepository, UserRepository userRepository) {
        this.recipientRepository = recipientRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<RecipientDto> getRecipientsForUser(Long userId) {
        return recipientRepository.findByUserIdOrderByFavoriteDescCreatedAtDesc(userId).stream()
                .map(this::mapToRecipientDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RecipientDto createRecipient(Long userId, CreateRecipientRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Recipient recipient = new Recipient();
        recipient.setUser(user);
        recipient.setName(request.getName().trim());
        recipient.setPhone(request.getPhone());
        recipient.setEmail(request.getEmail());
        recipient.setAccountNumber(request.getAccountNumber());
        recipient.setBankOrProvider(request.getBankOrProvider());
        recipient.setType(request.getType());
        recipient.setCurrency(request.getCurrency());
        recipient.setFavorite(request.isFavorite());

        Recipient saved = recipientRepository.save(recipient);
        return mapToRecipientDto(saved);
    }

    @Transactional
    public RecipientDto toggleFavorite(Long userId, Long recipientId) {
        Recipient recipient = recipientRepository.findByUserIdAndId(userId, recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

        recipient.setFavorite(!recipient.isFavorite());
        Recipient updated = recipientRepository.save(recipient);
        return mapToRecipientDto(updated);
    }

    @Transactional
    public void deleteRecipient(Long userId, Long recipientId) {
        Recipient recipient = recipientRepository.findByUserIdAndId(userId, recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));
        recipientRepository.delete(recipient);
    }

    public RecipientDto mapToRecipientDto(Recipient r) {
        RecipientDto dto = new RecipientDto();
        dto.setId(r.getId());
        dto.setName(r.getName());
        dto.setPhone(r.getPhone());
        dto.setEmail(r.getEmail());
        dto.setAccountNumber(r.getAccountNumber());
        dto.setBankOrProvider(r.getBankOrProvider());
        dto.setType(r.getType());
        dto.setCurrency(r.getCurrency());
        dto.setFavorite(r.isFavorite());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
