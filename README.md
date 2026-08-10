# AeroPay Network (Monorepo)

Production-grade cross-border remittance settlement platform and operations console.

```
AEROPAY NETWORK (Monorepo)
├── frontend/             # React Native / Expo Web & Mobile App (Docker ready)
│   ├── src/              # Application screens, context, hooks, & UI
│   ├── Dockerfile        # Multi-stage Expo Web + Nginx build
│   ├── nginx.conf        # Production SPA server config
│   └── package.json      # Frontend client dependencies
│
└── backend/              # Spring Boot Java Backend (Reserved for custom implementation)
```

---

## ⚡ Frontend Quick Start

```bash
# Install dependencies
npm install

# Start Frontend Expo Client
npm run start

# Start Expo Web
npm run web
```

---

## 🐳 Frontend Docker Deployment

```bash
# Build frontend docker image
docker build -t aeropay-frontend ./frontend

# Run frontend container
docker run -p 8080:80 aeropay-frontend
```

- **Frontend Web App**: `http://localhost:8080`

---

## 🔑 Demo Access Credentials

| Role                   | Email                   | Password   | Clearance Level      |
| :--------------------- | :---------------------- | :--------- | :------------------- |
| **Consumer (User)**    | `user@aeropay.network`  | `user123`  | Tier 2 Verified      |
| **Admin (Supervisor)** | `admin@aeropay.network` | `admin123` | Level 4 Root Control |

---

## 🧪 Quality & CI Workflows

```bash
# Type check frontend
npm run type-check

# Lint checks
npm run lint

# Prettier format check
npm run format:check
```
