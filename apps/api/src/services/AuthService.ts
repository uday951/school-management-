import { UserRepository } from '../repositories/UserRepository';
import { SchoolRepository } from '../repositories/SchoolRepository';
import { TokenService } from './TokenService';
import { EmailService } from './EmailService';
import { RegisterInput, LoginInput, ResetPasswordInput } from '@mahathi/validation';
import { generateRandomToken } from '@mahathi/utils';
import { IUserDocument } from '../models/User';

export class AuthService {
  private userRepo = new UserRepository();
  private schoolRepo = new SchoolRepository();
  private tokenService = new TokenService();
  private emailService = new EmailService();

  async register(input: RegisterInput): Promise<{ user: IUserDocument; schoolId?: string }> {
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User registration failed: Email address already registered.');
    }

    let resolvedSchoolId = input.schoolId;

    // Create a new school if schoolName was provided (typically by SCHOOL_ADMIN during setup)
    if (input.schoolName && !resolvedSchoolId) {
      const existingSchool = await this.schoolRepo.findByName(input.schoolName);
      if (existingSchool) {
        resolvedSchoolId = existingSchool._id.toString();
      } else {
        const newSchool = await this.schoolRepo.create(input.schoolName);
        resolvedSchoolId = newSchool._id.toString();
      }
    }

    const verificationToken = generateRandomToken();
    const newUser = await this.userRepo.create({
      ...input,
      passwordHash: input.password, // hashed inside pre-save hook
      schoolId: resolvedSchoolId,
      verificationToken,
    });

    await this.emailService.sendVerificationEmail(newUser.email, verificationToken);

    return { user: newUser, schoolId: resolvedSchoolId };
  }

  async login(input: LoginInput): Promise<{ accessToken: string; refreshToken: string; user: IUserDocument }> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new Error('Authentication failed: Invalid email or password.');
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new Error('Authentication failed: Invalid email or password.');
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      schoolId: user.schoolId?.toString(),
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    return { accessToken, refreshToken, user };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepo.findByVerificationToken(token);
    if (!user) {
      throw new Error('Verification failed: Invalid or expired token.');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await this.userRepo.update(user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      // For security, do not leak whether email exists. Just return silently.
      return;
    }

    const resetToken = generateRandomToken();
    user.passwordResetToken = resetToken;
    // Token expires in 1 hour
    user.passwordResetExpires = new Date(Date.now() + 3600000);
    await this.userRepo.update(user);

    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, input: ResetPasswordInput): Promise<void> {
    const user = await this.userRepo.findByResetToken(token);
    if (!user) {
      throw new Error('Recovery failed: Reset token is invalid or has expired.');
    }

    user.passwordHash = input.password; // hashed in pre-save hook
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await this.userRepo.update(user);
  }

  async refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.tokenService.verifyRefreshToken(token);
    const user = await this.userRepo.findById(payload.userId);
    if (!user) {
      throw new Error('Token refresh failed: User not found.');
    }

    const newPayload = {
      userId: user._id.toString(),
      role: user.role,
      schoolId: user.schoolId?.toString(),
    };

    const accessToken = this.tokenService.generateAccessToken(newPayload);
    const refreshToken = this.tokenService.generateRefreshToken(newPayload);

    return { accessToken, refreshToken };
  }
}
export default AuthService;
