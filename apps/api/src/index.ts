import app from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { logger } from './config/logger';

async function startServer() {
  // Connect to Database
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`=========================================`);
    logger.info(`  Server running in ${env.NODE_ENV} mode`);
    logger.info(`  API Gateway: http://localhost:${env.PORT}`);
    logger.info(`=========================================`);
  });

  // Graceful shutdown handling
  const shutdown = async () => {
    logger.info('Shutting down server processes...');
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      logger.info('Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
