import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import fxRoutes from './routes/fxRoutes.js';
import remittanceRoutes from './routes/remittanceRoutes.js';
import broadcastRoutes from './routes/broadcastRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'aeropay-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fx', fxRoutes);
app.use('/api/remittance', remittanceRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
