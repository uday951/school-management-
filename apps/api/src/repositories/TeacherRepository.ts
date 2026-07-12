import { BaseRepository } from './BaseRepository';
import { Teacher, ITeacherDocument } from '../models/Teacher';

export class TeacherRepository extends BaseRepository<ITeacherDocument> {
  constructor() {
    super(Teacher);
  }

  override async find(
    filter: any,
    options: {
      page?: number;
      limit?: number;
      sort?: any;
      search?: string;
      searchFields?: string[];
    } = {}
  ): Promise<{ items: ITeacherDocument[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const queryFilter = { ...filter, isDeleted: { $ne: true } };

    if (options.search && options.searchFields && options.searchFields.length > 0) {
      const searchRegex = new RegExp(options.search, 'i');
      queryFilter.$or = options.searchFields.map((field) => ({
        [field]: searchRegex,
      }));
    }

    const sortOption = options.sort || { createdAt: -1 };

    const [items, total] = await Promise.all([
      Teacher.find(queryFilter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email profile')
        .exec(),
      Teacher.countDocuments(queryFilter).exec(),
    ]);

    return { items, total };
  }
}
