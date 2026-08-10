package com.aeropay.network.service;

import com.aeropay.network.dto.SendMoneyRequest;
import com.aeropay.network.dto.TransactionDto;
import com.aeropay.network.exception.ResourceNotFoundException;
import com.aeropay.network.model.*;
import com.aeropay.network.repository.TransactionRepository;
import com.aeropay.network.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final FxService fxService;
    private final NotificationService notificationService;

    public TransactionService(TransactionRepository transactionRepository,
                              UserRepository userRepository,
                              WalletService walletService,
                              FxService fxService,
                              NotificationService notificationService) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.fxService = fxService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getTransactionsForUser(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToTransactionDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TransactionDto getTransactionByReference(String referenceId, Long userId) {
        Transaction tx = transactionRepository.findByReferenceId(referenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with reference: " + referenceId));

        if (!tx.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Transaction not accessible");
        }

        return mapToTransactionDto(tx);
    }

    @Transactional
    public TransactionDto sendMoney(Long userId, SendMoneyRequest request) {
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BigDecimal rate = fxService.getExchangeRate(request.getSourceCurrency(), request.getTargetCurrency());
        BigDecimal targetAmount = request.getAmount().multiply(rate).setScale(4, RoundingMode.HALF_UP);
        BigDecimal fee = request.getAmount().multiply(new BigDecimal("0.003")).setScale(4, RoundingMode.HALF_UP);
        BigDecimal totalDebit = request.getAmount().add(fee);

        // Debit sender wallet
        walletService.debitWallet(userId, request.getSourceCurrency(), totalDebit);

        // Build transaction
        Transaction tx = new Transaction();
        String ref = "TX-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        tx.setReferenceId(ref);
        tx.setUser(sender);
        tx.setType(TransactionType.SEND);
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setRecipientType(request.getRecipientType());
        tx.setRecipientName(request.getRecipientName());
        tx.setRecipientPhone(request.getRecipientPhone());
        tx.setRecipientEmail(request.getRecipientEmail());
        tx.setRecipientAccountNumber(request.getRecipientAccountNumber());
        tx.setAmount(request.getAmount());
        tx.setSourceCurrency(request.getSourceCurrency());
        tx.setTargetCurrency(request.getTargetCurrency());
        tx.setExchangeRate(rate);
        tx.setFee(fee);
        tx.setTotalAmount(totalDebit);
        tx.setDescription(request.getDescription() != null ? request.getDescription() : "Transfer to " + request.getRecipientName());
        tx.setStellarTxHash("0x" + UUID.randomUUID().toString().replace("-", ""));

        if (request.getRecipientType() == RecipientType.MOMO) {
            tx.setMomoTransactionId("MOMO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        Transaction savedTx = transactionRepository.save(tx);

        // If internal AeroPay transfer and recipient email exists, credit recipient
        if (request.getRecipientType() == RecipientType.AEROPAY && request.getRecipientEmail() != null) {
            Optional<User> recipientUserOpt = userRepository.findByEmail(request.getRecipientEmail().toLowerCase().trim());
            if (recipientUserOpt.isPresent()) {
                User recipientUser = recipientUserOpt.get();
                walletService.creditWallet(recipientUser.getId(), request.getTargetCurrency(), targetAmount);

                // Record inbound credit transaction for recipient
                Transaction inboundTx = new Transaction();
                inboundTx.setReferenceId("RX-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());
                inboundTx.setUser(recipientUser);
                inboundTx.setType(TransactionType.RECEIVE);
                inboundTx.setStatus(TransactionStatus.COMPLETED);
                inboundTx.setRecipientType(RecipientType.AEROPAY);
                inboundTx.setRecipientName(sender.getFullName());
                inboundTx.setRecipientEmail(sender.getEmail());
                inboundTx.setAmount(targetAmount);
                inboundTx.setSourceCurrency(request.getTargetCurrency());
                inboundTx.setTargetCurrency(request.getTargetCurrency());
                inboundTx.setExchangeRate(BigDecimal.ONE);
                inboundTx.setFee(BigDecimal.ZERO);
                inboundTx.setTotalAmount(targetAmount);
                inboundTx.setDescription("Received money from " + sender.getFullName());
                transactionRepository.save(inboundTx);

                // Notify recipient
                notificationService.sendDirectNotification(
                        recipientUser,
                        "Payment Received",
                        "You received " + targetAmount + " " + request.getTargetCurrency() + " from " + sender.getFullName(),
                        NotificationType.SUCCESS
                );
            }
        }

        // Notify sender
        notificationService.sendDirectNotification(
                sender,
                "Transfer Successful",
                "Successfully sent " + request.getAmount() + " " + request.getSourceCurrency() + " to " + request.getRecipientName(),
                NotificationType.SUCCESS
        );

        return mapToTransactionDto(savedTx);
    }

    public TransactionDto mapToTransactionDto(Transaction tx) {
        TransactionDto dto = new TransactionDto();
        dto.setId(tx.getId());
        dto.setReferenceId(tx.getReferenceId());
        dto.setUserId(tx.getUser().getId());
        dto.setUserName(tx.getUser().getFullName());
        dto.setUserEmail(tx.getUser().getEmail());
        dto.setType(tx.getType());
        dto.setStatus(tx.getStatus());
        dto.setRecipientType(tx.getRecipientType());
        dto.setRecipientName(tx.getRecipientName());
        dto.setRecipientPhone(tx.getRecipientPhone());
        dto.setRecipientEmail(tx.getRecipientEmail());
        dto.setRecipientAccountNumber(tx.getRecipientAccountNumber());
        dto.setAmount(tx.getAmount());
        dto.setSourceCurrency(tx.getSourceCurrency());
        dto.setTargetCurrency(tx.getTargetCurrency());
        dto.setExchangeRate(tx.getExchangeRate());
        dto.setFee(tx.getFee());
        dto.setTotalAmount(tx.getTotalAmount());
        dto.setDescription(tx.getDescription());
        dto.setStellarTxHash(tx.getStellarTxHash());
        dto.setMomoTransactionId(tx.getMomoTransactionId());
        dto.setCreatedAt(tx.getCreatedAt());
        return dto;
    }
}
