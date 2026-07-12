import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { TimetableDraft } from '../models/TimetableDraft';
import { TimeSlot } from '../models/TimeSlot';

export class TimetableWorkflowController {
  private async own(req: AuthRequest, id: string) {
    const draft = await TimetableDraft.findById(id);
    if (!draft || (req.user?.role !== 'SUPER_ADMIN' && draft.schoolId.toString() !== req.user?.schoolId)) return null;
    return draft;
  }
  async submitReview(req: AuthRequest, res: Response, next: NextFunction) { try {
    const draft = await this.own(req, req.params.id); if (!draft) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Draft not found.' } });
    if (!['DRAFT', 'SUCCESS', 'FAILED'].includes(draft.status)) return res.status(409).json({ success: false, error: { code: 'INVALID_STATE', message: 'Only completed drafts can be submitted for review.' } });
    draft.status = 'REVIEWED'; (draft as any).approval = { ...(draft as any).approval, submittedBy: req.user?.userId, reviewedAt: new Date() }; await draft.save(); res.json({ success: true, data: draft });
  } catch (e) { next(e); } }
  async approve(req: AuthRequest, res: Response, next: NextFunction) { try {
    const draft = await this.own(req, req.params.id); if (!draft) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Draft not found.' } });
    if (draft.status !== 'REVIEWED') return res.status(409).json({ success: false, error: { code: 'INVALID_STATE', message: 'Draft must be reviewed before approval.' } });
    draft.status = 'APPROVED'; (draft as any).approval = { ...(draft as any).approval, approvedBy: req.user?.userId, approvedAt: new Date() }; await draft.save(); res.json({ success: true, data: draft });
  } catch (e) { next(e); } }
  async publish(req: AuthRequest, res: Response, next: NextFunction) { try {
    const draft = await this.own(req, req.params.id); if (!draft) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Draft not found.' } });
    if (draft.status !== 'APPROVED') return res.status(409).json({ success: false, error: { code: 'INVALID_STATE', message: 'Only approved drafts can be published.' } });
    const slots = await TimeSlot.countDocuments({ draftId: draft._id }); if (!slots) return res.status(409).json({ success: false, error: { code: 'EMPTY_TIMETABLE', message: 'An empty timetable cannot be published.' } });
    await TimetableDraft.updateMany({ schoolId: draft.schoolId, termId: draft.termId, _id: { $ne: draft._id }, status: 'PUBLISHED' }, { status: 'ARCHIVED' });
    draft.status = 'PUBLISHED'; (draft as any).approval = { ...(draft as any).approval, publishedAt: new Date() }; await draft.save(); res.json({ success: true, data: draft });
  } catch (e) { next(e); } }
}
