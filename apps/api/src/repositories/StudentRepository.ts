import { BaseRepository } from './BaseRepository';
import { Student, IStudentDocument } from '../models/Student';

export class StudentRepository extends BaseRepository<IStudentDocument> {
  constructor() {
    super(Student);
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
  ): Promise<{ items: IStudentDocument[]; total: number }> {
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
      Student.find(queryFilter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'sectionId',
          populate: { path: 'gradeId', select: 'name' },
        })
        .exec(),
      Student.countDocuments(queryFilter).exec(),
    ]);

    return { items, total };
  }
}
