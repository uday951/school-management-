import { NextFunction, Response } from 'express';
import { AuthRequest } from './authMiddleware';
import { AuditLog } from '../models/AuditLog';

/** Records successful write requests without delaying the response. */
export function auditWrites(req: AuthRequest, res: Response, next: NextFunction) {
  res.on('finish', () => {
    if (res.statusCode >= 400 || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return;
    void AuditLog.create({ userId: req.user?.userId, action: req.method, module: req.path.split('/')[1] || 'system', description: `${req.method} ${req.originalUrl}`, ipAddress: req.ip || 'unknown', userAgent: req.get('user-agent'), timestamp: new Date() }).catch(() => undefined);
  });
  next();
}
