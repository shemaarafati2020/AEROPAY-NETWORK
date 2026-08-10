import http from 'http';
import { WebSocketServer } from 'ws';
import app from './app.js';
import { config } from './config/index.js';
import { BroadcastService } from './services/broadcastService.js';

const server = http.createServer(app);

// Attach WebSocket server for real-time push broadcasts
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  BroadcastService.registerClient(ws);
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'AeroPay WebSocket stream connected.' }));
});

server.listen(config.port, () => {
  console.log(`=============================================`);
  console.log(`🚀 AeroPay Network Settlement Engine Online`);
  console.log(`🌐 REST API: http://localhost:${config.port}`);
  console.log(`📡 WebSocket: ws://localhost:${config.port}/ws`);
  console.log(`⚡ Environment: ${config.nodeEnv}`);
  console.log(`=============================================`);
});
