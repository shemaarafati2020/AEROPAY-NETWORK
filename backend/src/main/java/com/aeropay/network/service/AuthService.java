package com.aeropay.network.service;

import com.aeropay.network.dto.*;
import com.aeropay.network.exception.BadRequestException;
import com.aeropay.network.exception.ResourceNotFoundException;
import com.aeropay.network.model.Currency;
import com.aeropay.network.model.KycStatus;
import com.aeropay.network.model.Role;
import com.aeropay.network.model.User;
import com.aeropay.network.repository.UserRepository;
import com.aeropay.network.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WalletService walletService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       WalletService walletService,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isBanned()) {
            throw new BadRequestException("Account has been suspended by administration");
        }

        return mapToAuthResponse(user, jwt);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email address is already in use");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(Role.ROLE_USER);
        user.setKycStatus(KycStatus.VERIFIED);
        user.setKycTier(1);
        user.setCurrency(request.getPreferredCurrency() != null ? request.getPreferredCurrency() : Currency.RWF);
        user.setActive(true);
        user.setBanned(false);
        user.setStellarPublicKey("G" + UUID.randomUUID().toString().replace("-", "").substring(0, 31).toUpperCase());

        User savedUser = userRepository.save(user);

        // Initialize primary wallet and secondary multi-currency wallets
        walletService.initializeDefaultWallets(savedUser);

        String jwt = tokenProvider.generateTokenFromUser(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole().name()
        );

        return mapToAuthResponse(savedUser, jwt);
    }

    @Transactional(readOnly = true)
    public UserProfileDto getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToUserProfileDto(user);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        if (request.getCurrency() != null) {
            user.setCurrency(request.getCurrency());
        }

        User updatedUser = userRepository.save(user);
        return mapToUserProfileDto(updatedUser);
    }

    public AuthResponse mapToAuthResponse(User user, String token) {
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setExpiresInMs(tokenProvider.getExpirationMs());
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole(user.getRole());
        response.setKycStatus(user.getKycStatus());
        response.setKycTier(user.getKycTier());
        response.setCurrency(user.getCurrency());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setStellarPublicKey(user.getStellarPublicKey());
        return response;
    }

    public UserProfileDto mapToUserProfileDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setKycStatus(user.getKycStatus());
        dto.setKycTier(user.getKycTier());
        dto.setCurrency(user.getCurrency());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setActive(user.isActive());
        dto.setBanned(user.isBanned());
        dto.setStellarPublicKey(user.getStellarPublicKey());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
