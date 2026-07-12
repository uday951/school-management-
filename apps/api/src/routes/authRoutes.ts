import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authRateLimiter } from '../middleware/rateLimiter';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();
const controller = new AuthController();

// Authentication routing definitions
router.post('/register', authRateLimiter, controller.register);
router.post('/login', authRateLimiter, controller.login);
router.post('/logout', requireAuth, controller.logout);
router.post('/refresh', controller.refresh);
router.get('/verify-email/:token', controller.verifyEmail);
router.post('/forgot-password', authRateLimiter, controller.forgotPassword);
router.post('/reset-password/:token', authRateLimiter, controller.resetPassword);

export default router;
