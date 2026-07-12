import { logger } from '../config/logger';

export class EmailService {
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;
    logger.info(`[Email Dispatch Mock] Sent Verification Email to: ${email}`);
    logger.info(`Verification URL: ${verificationUrl}`);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    logger.info(`[Email Dispatch Mock] Sent Password Reset Email to: ${email}`);
    logger.info(`Reset URL: ${resetUrl}`);
  }
}
export default EmailService;
