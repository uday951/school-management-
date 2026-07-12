import { User, IUserDocument } from '../models/User';
import { RegisterInput } from '@mahathi/validation';

export class UserRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email }).exec();
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id).exec();
  }

  async findByVerificationToken(token: string): Promise<IUserDocument | null> {
    return User.findOne({ verificationToken: token }).exec();
  }

  async findByResetToken(token: string): Promise<IUserDocument | null> {
    return User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).exec();
  }

  async create(data: RegisterInput & { passwordHash: string; verificationToken?: string }): Promise<IUserDocument> {
    const newUser = new User({
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      schoolId: data.schoolId,
      profile: {
        firstName: data.profile.firstName,
        lastName: data.profile.lastName,
        phoneNumber: data.profile.phoneNumber,
      },
      isVerified: false,
      verificationToken: data.verificationToken,
    });
    return newUser.save();
  }

  async update(user: IUserDocument): Promise<IUserDocument> {
    return user.save();
  }
}
