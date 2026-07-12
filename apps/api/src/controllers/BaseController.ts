import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { BaseRepository } from '../repositories/BaseRepository';
import { Document, Types } from 'mongoose';

// Duck-typed interface so any Zod schema version works without import coupling
interface ParseableSchema {
  parse: (data: unknown) => any;
}

export class BaseController<T extends Document> {
  protected repo: BaseRepository<T>;
  protected inputSchema?: ParseableSchema;
  protected searchFields: string[];

  constructor(repo: BaseRepository<T>, searchFields: string[] = [], inputSchema?: ParseableSchema) {
    this.repo = repo;
    this.searchFields = searchFields;
    this.inputSchema = inputSchema;
  }

  // Helper to extract schoolId filter based on user role
  protected getSchoolFilter(req: AuthRequest): any {
    if (!req.user) return {};
    const { role, schoolId } = req.user;
    if (role === 'SUPER_ADMIN') return {};
    // Cast string schoolId from JWT payload to ObjectId to match stored MongoDB type
    try {
      return { schoolId: new Types.ObjectId(schoolId) };
    } catch {
      return { schoolId };
    }
  }

  protected getTenantFilter(req: AuthRequest): any {
    const filter = this.getSchoolFilter(req);
    // Branch is always selected from the authenticated session, never from the query string.
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.branchId) {
      try { filter.branchId = new Types.ObjectId(req.user.branchId); } catch { filter.branchId = req.user.branchId; }
    }
    return filter;
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (this.inputSchema) {
        this.inputSchema.parse(req.body);
      }

      const schoolFilter = this.getTenantFilter(req);
      const payload = {
        ...req.body,
        ...schoolFilter, // Enforce schoolId matching
      };

      const item = await this.repo.create(payload);
      res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await this.repo.findById(req.params.id);
      if (!item) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Requested resource not found.' },
        });
      }

      // Assert school partition ownership
      if (req.user?.role !== 'SUPER_ADMIN' && (item as any).schoolId?.toString() !== req.user?.schoolId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access Denied: Tenant mismatch.' },
        });
      }

      res.status(200).json({ success: true, data: item });
    } catch (error: any) {
      next(error);
    }
  }

  async find(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const schoolFilter = this.getTenantFilter(req);
      
      // Parse query params
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const search = req.query.search as string || '';
      
      const sortField = req.query.sortBy as string || 'createdAt';
      const sortOrder = req.query.sortOrder as string === 'asc' ? 1 : -1;
      const sort = { [sortField]: sortOrder };

      // Strip pagination keys to get custom filters
      const customFilters: any = {};
      const ignoreKeys = ['page', 'limit', 'search', 'sortBy', 'sortOrder'];
      Object.keys(req.query).forEach((key) => {
        if (!ignoreKeys.includes(key) && req.query[key]) {
          customFilters[key] = req.query[key];
        }
      });

      const filter = {
        ...schoolFilter,
        ...customFilters,
      };

      const { items, total } = await this.repo.find(filter, {
        page,
        limit,
        sort,
        search,
        searchFields: this.searchFields,
      });

      res.status(200).json({
        success: true,
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (this.inputSchema) {
        this.inputSchema.parse(req.body);
      }

      const item = await this.repo.findById(req.params.id);
      if (!item) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Requested resource not found.' },
        });
      }

      // Assert ownership
      if (req.user?.role !== 'SUPER_ADMIN' && (item as any).schoolId?.toString() !== req.user?.schoolId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access Denied: Tenant mismatch.' },
        });
      }

      const updatedItem = await this.repo.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: updatedItem });
    } catch (error: any) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await this.repo.findById(req.params.id);
      if (!item) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Requested resource not found.' },
        });
      }

      // Assert ownership
      if (req.user?.role !== 'SUPER_ADMIN' && (item as any).schoolId?.toString() !== req.user?.schoolId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access Denied: Tenant mismatch.' },
        });
      }

      await this.repo.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Resource soft-deleted successfully.' });
    } catch (error: any) {
      next(error);
    }
  }

  async archive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await this.repo.findById(req.params.id);
      if (!item) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Requested resource not found.' },
        });
      }

      // Assert ownership
      if (req.user?.role !== 'SUPER_ADMIN' && (item as any).schoolId?.toString() !== req.user?.schoolId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access Denied: Tenant mismatch.' },
        });
      }

      await this.repo.archive(req.params.id);
      res.status(200).json({ success: true, message: 'Resource archived successfully.' });
    } catch (error: any) {
      next(error);
    }
  }

  async restore(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await this.repo.findOne({ _id: req.params.id, isDeleted: true });
      if (!item) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Requested resource not found in deletion logs.' },
        });
      }

      // Assert ownership
      if (req.user?.role !== 'SUPER_ADMIN' && (item as any).schoolId?.toString() !== req.user?.schoolId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access Denied: Tenant mismatch.' },
        });
      }

      await this.repo.restore(req.params.id);
      res.status(200).json({ success: true, message: 'Resource restored successfully.' });
    } catch (error: any) {
      next(error);
    }
  }

  async bulkDelete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Invalid payload: Array of IDs is required.' },
        });
      }

      await this.repo.bulkDelete(ids);
      res.status(200).json({ success: true, message: 'Bulk deletion operation completed.' });
    } catch (error: any) {
      next(error);
    }
  }

  async import(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { items } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Invalid payload: Array of items is required.' },
        });
      }

      const schoolFilter = this.getTenantFilter(req);
      const parsedItems = items.map((item) => {
        if (this.inputSchema) {
          this.inputSchema.parse(item);
        }
        return {
          ...item,
          ...schoolFilter, // Enforce schoolId on import
        };
      });

      await this.repo.bulkCreate(parsedItems);
      res.status(201).json({ success: true, message: `${parsedItems.length} items imported successfully.` });
    } catch (error: any) {
      next(error);
    }
  }
}
export default BaseController;
