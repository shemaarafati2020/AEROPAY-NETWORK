# AeroPay Network (Monorepo)

Production-grade cross-border remittance settlement platform and operations console.

```
AEROPAY NETWORK (Monorepo)
├── frontend/             # React Native / Expo Web & Mobile App (Dockerized)
│   ├── src/              # Glassmorphic OLED UI, state, & hooks
│   ├── Dockerfile        # Multi-stage Expo Web + Nginx build
│   ├── nginx.conf        # Production SPA server config
│   └── package.json      # Frontend workspace
│
├── backend/              # Enterprise Spring Boot 3 Java Backend
│   ├── src/              # Controllers, Services, Repositories, JPA Entities, Security
│   ├── Dockerfile        # Multi-stage Maven + Eclipse Temurin 21 JRE container
│   ├── pom.xml           # Spring Boot 3 + PostgreSQL + JWT + OpenAPI dependencies
│   └── README.md         # Backend API documentation
│
└── docker-compose.yml    # Full-stack orchestration (PostgreSQL + Spring Boot + Frontend)
```

---

## ⚡ Quick Start

### 1. Full-Stack Docker Compose (Recommended)

```bash
docker compose up --build -d
```

- **Frontend Web UI**: `http://localhost`
- **Spring Boot Backend**: `http://localhost:8080`
- **Swagger / OpenAPI Documentation**: `http://localhost:8080/swagger-ui.html`
- **PostgreSQL Database**: `localhost:5432` (`aeropay_db`)

### 2. Frontend Local Development

```bash
# Install dependencies
npm install

# Start Expo Web
npm run web
```

### 3. Backend Local Development

```bash
# Run tests
npm run backend:test

# Start Spring Boot application
npm run backend:run
```

---

## 🔑 Demo Access Credentials

The backend automatically seeds these demo accounts upon startup:

| Role                   | Email               | Password   | Permissions                                                  |
| :--------------------- | :------------------ | :--------- | :----------------------------------------------------------- |
| **Consumer (User)**    | `user@aeropay.com`  | `user123`  | Multi-currency wallets, instant remittance, savings vaults   |
| **Admin (Supervisor)** | `admin@aeropay.com` | `admin123` | Platform KPIs, user management, KYC verification, broadcasts |

---

## 🧪 Quality & CI Workflows

```bash
# Full frontend validation
npm run type-check
npm run lint
npm run format:check

# Backend tests
npm run backend:test
```
