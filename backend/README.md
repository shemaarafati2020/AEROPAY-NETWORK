# AeroPay Network - Backend Settlement Engine

Enterprise Settlement, FX, and Operations API Engine built with Node.js, Express, TypeScript, and Stellar Soroban.

## Architecture

- ⚡ **Soroban Paymaster**: Sponsored gas settlement engine for zero-gas blockchain transactions.
- 💱 **FX Corridor Engine**: Real-time wholesale and retail rate calculator for RWF, KES, and USD.
- 📱 **Mobile Money Integrations**: Direct payment rail connectors for MTN MoMo Rwanda, Airtel Money, and Kenya M-Pesa.
- 📡 **WebSocket Broadcaster**: Live real-time push announcements across client devices.
- 🛡️ **Role-Based Access Control**: Level 4 Root Admin authority endpoints with immutable audit logging.

## API Endpoints

### Authentication

- `POST /api/auth/login` - User/Admin login
- `POST /api/auth/signup` - Register new consumer account
- `POST /api/auth/demo-login` - Instant demo account switch (`role: "user" | "admin"`)

### FX & Corridors

- `GET /api/fx/rates` - Get live wholesale and effective exchange rates
- `GET /api/fx/quote` - Calculate remittance payout and platform fee
- `POST /api/fx/rates` - _(Admin)_ Broadcast updated wholesale rates

### Remittance

- `POST /api/remittance/send` - Execute sub-second mobile money remittance
- `GET /api/remittance/history` - User transaction history

### Push Broadcasts

- `GET /api/broadcasts` - List broadcast history
- `POST /api/broadcasts` - _(Admin)_ Dispatch live push announcement to targeted segments
- `WS /ws` - WebSocket stream for live push broadcast delivery

### Admin Operations

- `GET /api/admin/dashboard` - Executive Bento KPI metrics & settings
- `PATCH /api/admin/settings` - Update corridor switches & system parameters
- `POST /api/admin/gas-relayer/topup` - Sponsor XLM gas for Soroban paymaster
- `POST /api/admin/liquidity/inject` - Inject USDC reserve liquidity
- `GET /api/admin/audit-logs` - Query immutable audit logs

## Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build TypeScript
npm run build

# Start production server
npm run start
```

## Docker

```bash
# Build docker image
docker build -t aeropay-backend .

# Run container
docker run -p 5000:5000 aeropay-backend
```
