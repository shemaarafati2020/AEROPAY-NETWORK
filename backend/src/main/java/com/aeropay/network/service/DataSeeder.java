package com.aeropay.network.service;

import com.aeropay.network.model.*;
import com.aeropay.network.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final RecipientRepository recipientRepository;
    private final VaultRepository vaultRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      WalletRepository walletRepository,
                      RecipientRepository recipientRepository,
                      VaultRepository vaultRepository,
                      TransactionRepository transactionRepository,
                      NotificationRepository notificationRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.recipientRepository = recipientRepository;
        this.vaultRepository = vaultRepository;
        this.transactionRepository = transactionRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already seeded. Skipping initial seeding.");
            return;
        }

        logger.info("Seeding initial data for AeroPay Network...");

        // 1. Seed Admin User
        User admin = new User();
        admin.setEmail("admin@aeropay.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("AeroPay Administrator");
        admin.setPhoneNumber("+250788000000");
        admin.setRole(Role.ROLE_ADMIN);
        admin.setKycStatus(KycStatus.VERIFIED);
        admin.setKycTier(3);
        admin.setCurrency(Currency.USD);
        admin.setActive(true);
        admin.setBanned(false);
        admin.setStellarPublicKey("GADMIN" + UUID.randomUUID().toString().replace("-", "").substring(0, 25).toUpperCase());
        admin = userRepository.save(admin);

        // Admin Wallets
        walletRepository.save(new Wallet(admin, Currency.USD, new BigDecimal("100000.0000"), true));
        walletRepository.save(new Wallet(admin, Currency.RWF, new BigDecimal("150000000.0000"), false));
        walletRepository.save(new Wallet(admin, Currency.EUR, new BigDecimal("85000.0000"), false));

        // 2. Seed Standard Demo User
        User user = new User();
        user.setEmail("user@aeropay.com");
        user.setPassword(passwordEncoder.encode("user123"));
        user.setFullName("Arafati Shema");
        user.setPhoneNumber("+250788123456");
        user.setRole(Role.ROLE_USER);
        user.setKycStatus(KycStatus.VERIFIED);
        user.setKycTier(2);
        user.setCurrency(Currency.RWF);
        user.setActive(true);
        user.setBanned(false);
        user.setStellarPublicKey("GUSER" + UUID.randomUUID().toString().replace("-", "").substring(0, 26).toUpperCase());
        user = userRepository.save(user);

        // User Wallets
        walletRepository.save(new Wallet(user, Currency.RWF, new BigDecimal("2450000.0000"), true));
        walletRepository.save(new Wallet(user, Currency.USD, new BigDecimal("1850.5000"), false));
        walletRepository.save(new Wallet(user, Currency.EUR, new BigDecimal("650.0000"), false));
        walletRepository.save(new Wallet(user, Currency.KES, new BigDecimal("45000.0000"), false));

        // 3. Seed Beneficiaries / Recipients for Demo User
        Recipient r1 = new Recipient();
        r1.setUser(user);
        r1.setName("Alice Umutoni");
        r1.setPhone("+250788111222");
        r1.setBankOrProvider("MTN Mobile Money");
        r1.setType(RecipientType.MOMO);
        r1.setCurrency(Currency.RWF);
        r1.setFavorite(true);
        recipientRepository.save(r1);

        Recipient r2 = new Recipient();
        r2.setUser(user);
        r2.setName("David Mugisha");
        r2.setPhone("+250789333444");
        r2.setAccountNumber("00045892019");
        r2.setBankOrProvider("Bank of Kigali");
        r2.setType(RecipientType.BANK);
        r2.setCurrency(Currency.RWF);
        r2.setFavorite(true);
        recipientRepository.save(r2);

        Recipient r3 = new Recipient();
        r3.setUser(user);
        r3.setName("Sarah Jenkins");
        r3.setEmail("sarah.jenkins@aeropay.com");
        r3.setType(RecipientType.AEROPAY);
        r3.setCurrency(Currency.USD);
        r3.setFavorite(false);
        recipientRepository.save(r3);

        // 4. Seed Savings Vaults for Demo User
        Vault v1 = new Vault();
        v1.setUser(user);
        v1.setName("Emergency Buffer");
        v1.setCategory(VaultCategory.EMERGENCY);
        v1.setCurrency(Currency.RWF);
        v1.setTargetAmount(new BigDecimal("1000000.0000"));
        v1.setCurrentAmount(new BigDecimal("650000.0000"));
        v1.setTargetDate(LocalDate.now().plusMonths(6));
        v1.setAutoSaveAmount(new BigDecimal("50000.0000"));
        v1.setAutoSaveFrequency("MONTHLY");
        v1.setStatus(VaultStatus.ACTIVE);
        v1.setInterestRate(new BigDecimal("8.50"));
        vaultRepository.save(v1);

        Vault v2 = new Vault();
        v2.setUser(user);
        v2.setName("Silicon Valley Trip");
        v2.setCategory(VaultCategory.EDUCATION);
        v2.setCurrency(Currency.USD);
        v2.setTargetAmount(new BigDecimal("3000.0000"));
        v2.setCurrentAmount(new BigDecimal("1450.0000"));
        v2.setTargetDate(LocalDate.now().plusMonths(10));
        v2.setAutoSaveAmount(new BigDecimal("150.0000"));
        v2.setAutoSaveFrequency("MONTHLY");
        v2.setStatus(VaultStatus.ACTIVE);
        v2.setInterestRate(new BigDecimal("6.00"));
        vaultRepository.save(v2);

        // 5. Seed Initial Transaction History
        Transaction t1 = new Transaction();
        t1.setReferenceId("TX-MOMO-90218");
        t1.setUser(user);
        t1.setType(TransactionType.SEND);
        t1.setStatus(TransactionStatus.COMPLETED);
        t1.setRecipientType(RecipientType.MOMO);
        t1.setRecipientName("Alice Umutoni");
        t1.setRecipientPhone("+250788111222");
        t1.setAmount(new BigDecimal("85000.0000"));
        t1.setSourceCurrency(Currency.RWF);
        t1.setTargetCurrency(Currency.RWF);
        t1.setExchangeRate(BigDecimal.ONE);
        t1.setFee(new BigDecimal("255.0000"));
        t1.setTotalAmount(new BigDecimal("85255.0000"));
        t1.setDescription("Family support stipend");
        t1.setStellarTxHash("0x9c882a1e4b47f078d6b9c9f28");
        t1.setMomoTransactionId("MOMO-882910");
        transactionRepository.save(t1);

        Transaction t2 = new Transaction();
        t2.setReferenceId("DEP-TOPUP-1102");
        t2.setUser(user);
        t2.setType(TransactionType.TOPUP);
        t2.setStatus(TransactionStatus.COMPLETED);
        t2.setRecipientType(RecipientType.MOMO);
        t2.setRecipientName("Self Deposit (Instant Mobile Money)");
        t2.setAmount(new BigDecimal("500000.0000"));
        t2.setSourceCurrency(Currency.RWF);
        t2.setTargetCurrency(Currency.RWF);
        t2.setExchangeRate(BigDecimal.ONE);
        t2.setFee(BigDecimal.ZERO);
        t2.setTotalAmount(new BigDecimal("500000.0000"));
        t2.setDescription("Instant wallet top-up via MTN MoMo");
        transactionRepository.save(t2);

        // 6. Seed System Notifications
        Notification n1 = new Notification(
                user,
                "Welcome to AeroPay Network",
                "Your account is verified and ready for instant zero-fee remittances and multi-currency savings.",
                NotificationType.SUCCESS
        );
        notificationRepository.save(n1);

        Notification n2 = new Notification(
                null,
                "Network Security Upgrade Complete",
                "Stellar Horizon relay throughput has been upgraded to 5,000 TPS with 0-latency settlement.",
                NotificationType.INFO
        );
        notificationRepository.save(n2);

        logger.info("Data seeding completed successfully!");
    }
}
