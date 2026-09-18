import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { config } from '../config';
import { logger } from '../utils/logger';

export function setupWebSockets(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Rates namespace
  const ratesNamespace = io.of('/rates');
  ratesNamespace.on('connection', (socket) => {
    logger.info(`Rates client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Rates client disconnected: ${socket.id}`);
    });
  });

  // Chat namespace
  const chatNamespace = io.of('/chat');
  chatNamespace.on('connection', (socket) => {
    logger.info(`Chat client connected: ${socket.id}`);

    socket.on('join', (conversationId: string) => {
      socket.join(conversationId);
      logger.debug(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Chat client disconnected: ${socket.id}`);
    });
  });

  logger.info('WebSocket servers initialized (/rates and /chat)');

  return io;
}
