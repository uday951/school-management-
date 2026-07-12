import { Request, Response, NextFunction } from 'express';
import TokenService from '../services/TokenService';

const tokenService = new TokenService();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    schoolId?: string;
    branchId?: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please login.' },
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = tokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired.' },
    });
  }
}
