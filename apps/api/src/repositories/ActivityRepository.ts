import { BaseRepository } from './BaseRepository';
import { Activity, IActivityDocument } from '../models/Activity';

export class ActivityRepository extends BaseRepository<IActivityDocument> {
  constructor() {
    super(Activity);
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
  ): Promise<{ items: IActivityDocument[]; total: number }> {
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
      Activity.find(queryFilter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('teacherId', 'email profile')
        .populate('roomId', 'name capacity')
        .exec(),
      Activity.countDocuments(queryFilter).exec(),
    ]);

    return { items, total };
  }
}
