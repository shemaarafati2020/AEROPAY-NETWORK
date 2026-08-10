# AeroPay Network (Monorepo)

Production-grade cross-border remittance settlement platform and operations console built with **React Native / Expo** (Frontend), **Node.js / Express / TypeScript** (Backend), and **Stellar Soroban Smart Contracts**.

```
AEROPAY NETWORK (Monorepo)
├── frontend/             # React Native / Expo Web & Mobile App
│   ├── src/              # Application screens, context, hooks, & UI
│   ├── Dockerfile        # Multi-stage Expo Web + Nginx build
│   └── nginx.conf        # Production SPA server config
│
├── backend/              # Node.js & TypeScript Settlement Engine
│   ├── src/              # REST & WebSocket APIs, Stellar Paymasters, & Rails
│   ├── Dockerfile        # Production container build
│   └── .env.example      # Environment variables schema
│
├── docker-compose.yml    # Full-stack orchestration (Frontend + Backend + Redis)
└── package.json          # Monorepo workspaces coordinator
```

---

## ⚡ Quick Start

### 1. Monorepo Setup & Local Development

```bash
# Install dependencies across all workspaces
npm install

# Start Backend API & WebSocket server (port 5000)
npm run dev:backend

# In a new terminal, start Frontend Expo Client (port 8081 / Web)
npm run dev:frontend
```

---

## 🐳 Docker Deployment

Run the entire full-stack stack (Frontend + Backend + Redis) with a single command:

```bash
# Build and launch all containers in background
docker compose up -d --build

# View container logs
docker compose logs -f

# Shut down containers
docker compose down
```

### Container Endpoints:

- **Frontend Web App**: `http://localhost:8080`
- **Backend REST API**: `http://localhost:5000/api`
- **WebSocket Stream**: `ws://localhost:5000/ws`
- **Health Check**: `http://localhost:5000/health`

---

## 🔑 Demo Access Credentials

| Role                   | Email                   | Password   | Clearance Level      |
| :--------------------- | :---------------------- | :--------- | :------------------- |
| **Consumer (User)**    | `user@aeropay.network`  | `user123`  | Tier 2 Verified      |
| **Admin (Supervisor)** | `admin@aeropay.network` | `admin123` | Level 4 Root Control |

---

## 🧪 Quality & CI Workflows

```bash
# Type check both frontend and backend
npm run type-check

# Lint checks
npm run lint

# Prettier format check
npm run format:check
```
