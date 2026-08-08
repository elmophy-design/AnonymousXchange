import http from 'http';
import { app } from './app';
import { setupWebSockets } from './websockets';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { config } from './config';

async function bootstrap() {
  try {
    // Connect to database
    await connectDatabase();

    const server = http.createServer(app);

    // Setup WebSocket servers (rates + chat)
    setupWebSockets(server);

    const PORT = config.port;

    server.listen(PORT, () => {
      logger.info(`🚀 AnonymousXchange backend running on port ${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Frontend URL: ${config.frontendUrl}`);
    });

    // Graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, () => {
        logger.info(`${signal} received. Shutting down gracefully...`);
        server.close(() => {
          logger.info('HTTP server closed');
          process.exit(0);
        });
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

bootstrap();
