# AeroPay Network - Backend Microservice

Enterprise **Spring Boot 3** and **PostgreSQL** backend service for the **AeroPay Network** financial platform.

---

## 🚀 Architecture Highlights

- **Framework**: Spring Boot 3.3.4 (Java 21/25)
- **Database**: PostgreSQL with Spring Data JPA & Hibernate
- **Security**: Stateless Spring Security 6 with HMAC-SHA256 JWT tokens & Role-Based Access Control (`ROLE_USER`, `ROLE_ADMIN`)
- **API Documentation**: OpenAPI 3 / Swagger UI (`/swagger-ui.html`)
- **Containerization**: Multi-stage lightweight Alpine Docker container

---

## 📂 Architecture & Package Layout

```
com.aeropay.network
├── AeroPayApplication.java      # Application bootstrap
├── config                       # Security, CORS, OpenAPI Swagger
├── controller                   # REST endpoints (Auth, Wallets, FX, Remittance, Vaults, Admin)
├── dto                          # Request and response transfer models
├── exception                    # Global error handling and exceptions
├── model                        # JPA entities and enums (User, Wallet, Transaction, Vault, etc.)
├── repository                   # Spring Data JPA query repositories
├── security                     # JWT provider, filter, and user details
└── service                      # Business logic, FX engine, and initial seeders
```

---

## 🔑 Default Credentials & Roles

The system automatically initializes and seeds demo accounts upon the first run:

| Role              | Email               | Password   | Key Permissions                                                                 |
| :---------------- | :------------------ | :--------- | :------------------------------------------------------------------------------ |
| **Admin**         | `admin@aeropay.com` | `admin123` | Platform KPIs, user suspension/KYC approval, audit logs, notification broadcast |
| **Standard User** | `user@aeropay.com`  | `user123`  | Multi-currency wallets, instant remittance, savings vaults, transaction history |

---

## 🛠️ REST API Endpoints Overview

### 1. Authentication & Profile (`/api/auth`)

- `POST /api/auth/login`: Authenticate and receive JWT
- `POST /api/auth/register`: Create a new user with initialized multi-currency wallets
- `GET /api/auth/me`: Get current user details and KYC tier
- `PUT /api/auth/profile`: Update profile info and preferred currency

### 2. Multi-Currency Wallets (`/api/wallets`)

- `GET /api/wallets`: Retrieve user balances across RWF, USD, EUR, KES, UGX, NGN, GBP
- `GET /api/wallets/{currency}`: Retrieve balance for a single currency
- `POST /api/wallets/fund`: Top up wallet via Mobile Money, Card, or Stellar

### 3. Remittances & Transfers (`/api/transactions`)

- `GET /api/transactions`: Transaction history
- `GET /api/transactions/{ref}`: Transaction lookup
- `POST /api/transactions/send`: Instant cross-border remittance with automated FX conversion and Stellar tx hash generation

### 4. FX & Guaranteed Quotes (`/api/fx`)

- `GET /api/fx/rates`: Real-time cross-currency rates with 24h market variance
- `POST /api/fx/quote`: 60-second guaranteed conversion quote with transparent fees

### 5. Beneficiaries (`/api/recipients`)

- `GET /api/recipients`: List saved recipients
- `POST /api/recipients`: Save a new beneficiary (MTN MoMo, Airtel Money, Bank, Stellar)
- `PATCH /api/recipients/{id}/favorite`: Toggle favorite status
- `DELETE /api/recipients/{id}`: Delete recipient

### 6. Savings Vaults (`/api/vaults`)

- `GET /api/vaults`: List active savings vaults
- `POST /api/vaults`: Create target savings vault (with 8.5% annual yield)
- `POST /api/vaults/{id}/deposit`: Deposit funds into vault
- `POST /api/vaults/{id}/withdraw`: Withdraw funds to wallet

### 7. Notifications (`/api/notifications`)

- `GET /api/notifications`: Retrieve in-app alerts and announcements
- `PATCH /api/notifications/{id}/read`: Mark notification as read
- `PATCH /api/notifications/read-all`: Mark all notifications as read

### 8. Admin Operations (`/api/admin`) _(Restricted to `ROLE_ADMIN`)_

- `GET /api/admin/stats`: Real-time platform metrics, total volume, fee revenue, 24h stats
- `GET /api/admin/users`: Search and paginate all registered users
- `PATCH /api/admin/users/{id}`: Manage KYC, role elevation, and ban/unban users
- `GET /api/admin/transactions`: Global transaction ledger audit
- `GET /api/admin/audit-logs`: System audit trail
- `POST /api/admin/broadcast`: Broadcast system notifications to all users

---

## 🏃 Local Development

### 1. Build with Maven

```bash
cd backend
mvn clean package
```

### 2. Run Locally

```bash
mvn spring-boot:run
```

Swagger API Docs will be available at: `http://localhost:8080/swagger-ui.html`
