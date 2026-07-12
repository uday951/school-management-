import { Model, Document } from 'mongoose';

export class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: any): Promise<T> {
    const item = new this.model(data);
    return item.save();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findOne({ _id: id, isDeleted: { $ne: true } }).exec();
  }

  async findOne(filter: any): Promise<T | null> {
    return this.model.findOne({ ...filter, isDeleted: { $ne: true } }).exec();
  }

  async find(
    filter: any,
    options: {
      page?: number;
      limit?: number;
      sort?: any;
      search?: string;
      searchFields?: string[];
    } = {}
  ): Promise<{ items: T[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const queryFilter = { ...filter, isDeleted: { $ne: true } };

    // Text search query matching searchFields array
    if (options.search && options.searchFields && options.searchFields.length > 0) {
      const searchRegex = new RegExp(options.search, 'i');
      queryFilter.$or = options.searchFields.map((field) => ({
        [field]: searchRegex,
      }));
    }

    const sortOption = options.sort || { createdAt: -1 };

    const [items, total] = await Promise.all([
      this.model.find(queryFilter).sort(sortOption).skip(skip).limit(limit).exec(),
      this.model.countDocuments(queryFilter).exec(),
    ]);

    return { items, total };
  }

  async update(id: string, data: any): Promise<T | null> {
    return this.model
      .findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, data, { new: true })
      .exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model
      .findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true })
      .exec();
  }

  async archive(id: string): Promise<T | null> {
    return this.model
      .findOneAndUpdate({ _id: id }, { isArchived: true }, { new: true })
      .exec();
  }

  async restore(id: string): Promise<T | null> {
    return this.model
      .findOneAndUpdate({ _id: id }, { isDeleted: false, isArchived: false }, { new: true })
      .exec();
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.model.updateMany({ _id: { $in: ids } }, { isDeleted: true }).exec();
  }

  async bulkCreate(items: any[]): Promise<T[]> {
    return this.model.insertMany(items);
  }
}
export default BaseRepository;
