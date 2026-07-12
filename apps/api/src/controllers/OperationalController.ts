import { NextFunction, Response } from 'express';
import { Model, Types } from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';

/** Secure CRUD adapter for operational modules. Every request is tenant scoped. */
export class OperationalController {
  constructor(private readonly entity: Model<any>, private readonly searchFields: string[] = ['name', 'title']) {}
  private filter(req: AuthRequest) {
    if (req.user?.role === 'SUPER_ADMIN') return { isDeleted: { $ne: true } };
    const result: any = { schoolId: new Types.ObjectId(req.user!.schoolId), isDeleted: { $ne: true } };
    if (req.user?.branchId) result.branchId = new Types.ObjectId(req.user.branchId);
    return result;
  }
  async list(req: AuthRequest, res: Response, next: NextFunction) { try {
    const filter: any = this.filter(req); const search = String(req.query.search || '');
    if (search) filter.$or = this.searchFields.map((f) => ({ [f]: new RegExp(search, 'i') }));
    const page = Math.max(Number(req.query.page) || 1, 1); const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
    const [data, total] = await Promise.all([this.entity.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), this.entity.countDocuments(filter)]);
    res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) { next(e); } }
  async create(req: AuthRequest, res: Response, next: NextFunction) { try {
    const scope = this.filter(req); delete scope.isDeleted;
    const data = await this.entity.create({ ...req.body, ...scope }); res.status(201).json({ success: true, data });
  } catch (e) { next(e); } }
  async update(req: AuthRequest, res: Response, next: NextFunction) { try {
    const data = await this.entity.findOneAndUpdate({ ...this.filter(req), _id: req.params.id }, { $set: req.body }, { new: true });
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found.' } }); res.json({ success: true, data });
  } catch (e) { next(e); } }
  async remove(req: AuthRequest, res: Response, next: NextFunction) { try {
    const data = await this.entity.findOneAndUpdate({ ...this.filter(req), _id: req.params.id }, { $set: { isDeleted: true } }, { new: true });
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found.' } }); res.json({ success: true });
  } catch (e) { next(e); } }
  async archive(req: AuthRequest, res: Response, next: NextFunction) { try {
    const data = await this.entity.findOneAndUpdate({ ...this.filter(req), _id: req.params.id }, { $set: { isArchived: true } }, { new: true });
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found.' } }); res.json({ success: true, data });
  } catch (e) { next(e); } }
  async restore(req: AuthRequest, res: Response, next: NextFunction) { try {
    const scope = this.filter(req); const data = await this.entity.findOneAndUpdate({ ...scope, _id: req.params.id }, { $set: { isArchived: false, isDeleted: false } }, { new: true });
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found.' } }); res.json({ success: true, data });
  } catch (e) { next(e); } }
  async import(req: AuthRequest, res: Response, next: NextFunction) { try {
    if (!Array.isArray(req.body.items) || !req.body.items.length) return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'items must be a non-empty array.' } });
    const scope = this.filter(req); delete scope.isDeleted; const data = await this.entity.insertMany(req.body.items.map((item: any) => ({ ...item, ...scope })));
    res.status(201).json({ success: true, message: `${data.length} records imported.`, data });
  } catch (e) { next(e); } }
}
