import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import { cookieMiddleware } from './middleware/cookieMiddleware';
import { auditWrites } from './middleware/auditMiddleware';
import authRoutes from './routes/authRoutes';
import erpRoutes from './routes/erpRoutes';

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: 'http://localhost:3000', // React client URL
    credentials: true,
  })
);

// Gzip compression
app.use(compression());

// Parse JSON request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Cookie parser middleware
app.use(cookieMiddleware);
app.use(auditWrites);

// HTTP request logging mapped to Winston stream
const morganStream = {
  write: (message: string) => logger.info(message.trim()),
};
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

// Apply rate limiting to all API endpoints
app.use('/api/', apiRateLimiter);

// Authentication Routes
app.use('/api/v1/auth', authRoutes);

// ERP Modules Routes
app.use('/api/v1/erp', erpRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API service is running and healthy.' });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route '${req.originalUrl}' does not exist on this server.` },
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
