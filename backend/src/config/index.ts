import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'aeropay-development-jwt-secret',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  stellar: {
    network: process.env.STELLAR_NETWORK || 'testnet',
    horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  },
  initialAnchorReserveUsdc: parseFloat(process.env.INITIAL_ANCHOR_RESERVE_USDC || '2450000'),
  initialGasRelayerXlm: parseFloat(process.env.INITIAL_GAS_RELAYER_XLM || '14850'),
};
