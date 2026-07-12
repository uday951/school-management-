import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { RegisterInputSchema, LoginInputSchema, ForgotPasswordInputSchema, ResetPasswordInputSchema } from '@mahathi/validation';
import { AuthRequest } from '../middleware/authMiddleware';

const authService = new AuthService();
const auditLogRepo = new AuditLogRepository();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = RegisterInputSchema.parse(req.body);
      const { user, schoolId } = await authService.register(validatedInput);

      await auditLogRepo.log({
        userId: user._id.toString(),
        email: user.email,
        action: 'USER_REGISTER',
        module: 'auth',
        description: `Successfully registered user with role ${user.role} for school ID: ${schoolId || 'none'}`,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({
        success: true,
        data: {
          userId: user._id,
          email: user.email,
          role: user.role,
          schoolId,
          profile: user.profile,
          isVerified: user.isVerified,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = LoginInputSchema.parse(req.body);
      const { accessToken, refreshToken, user } = await authService.login(validatedInput);

      await auditLogRepo.log({
        userId: user._id.toString(),
        email: user.email,
        action: 'USER_LOGIN',
        module: 'auth',
        description: `Successfully logged in user with role ${user.role}`,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'],
      });

      // Save Refresh Token inside HttpOnly Secure cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          user: {
            userId: user._id,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId,
            profile: user.profile,
            isVerified: user.isVerified,
          },
        },
      });
    } catch (error: any) {
      // Log failed login attempt
      await auditLogRepo.log({
        email: req.body.email,
        action: 'USER_LOGIN_FAILED',
        module: 'auth',
        description: `Failed login attempt: ${error.message}`,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'],
      });
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await auditLogRepo.log({
          userId: req.user.userId,
          email: req.user.role,
          action: 'USER_LOGOUT',
          module: 'auth',
          description: `User successfully logged out`,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'],
        });
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(200).json({
        success: true,
        message: 'Successfully logged out.',
      });
    } catch (error: any) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: { code: 'REFRESH_TOKEN_REQUIRED', message: 'Refresh token cookie is missing.' },
        });
      }

      const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(refreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        data: { accessToken },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token || req.query.token as string;
      if (!token) {
        return res.status(400).json({
          success: false,
          error: { code: 'TOKEN_REQUIRED', message: 'Email verification token is required.' },
        });
      }

      await authService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: 'Email address verified successfully.',
      });
    } catch (error: any) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = ForgotPasswordInputSchema.parse(req.body);
      await authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: 'If the email matches a registered account, a password reset link has been sent.',
      });
    } catch (error: any) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token || req.body.token;
      const validatedInput = ResetPasswordInputSchema.parse(req.body);

      if (!token) {
        return res.status(400).json({
          success: false,
          error: { code: 'TOKEN_REQUIRED', message: 'Password recovery token is required.' },
        });
      }

      await authService.resetPassword(token, validatedInput);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully. You can now login with your new credentials.',
      });
    } catch (error: any) {
      next(error);
    }
  }
}
export default AuthController;
