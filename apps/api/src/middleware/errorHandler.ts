import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  // Log full error details inside logger
  logger.error(`${req.method} ${req.url} - Error Code: ${errorCode} - Message: ${err.message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected server error occurred.',
      details: err.details || null,
    },
  });
}
