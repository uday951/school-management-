import { School, ISchoolDocument } from '../models/School';

export class SchoolRepository {
  async findById(id: string): Promise<ISchoolDocument | null> {
    return School.findById(id).exec();
  }

  async findByName(name: string): Promise<ISchoolDocument | null> {
    return School.findOne({ name }).exec();
  }

  async create(name: string): Promise<ISchoolDocument> {
    const newSchool = new School({
      name,
      subscriptionTier: 'FREE',
      isActive: true,
    });
    return newSchool.save();
  }
}
