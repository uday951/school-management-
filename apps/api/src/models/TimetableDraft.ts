import mongoose, { Schema, Document } from 'mongoose';
import { ITimetableDraft } from '@mahathi/types';

export interface ITimetableDraftDocument extends Omit<ITimetableDraft, '_id'>, Document {}

const TimetableDraftSchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    termId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    version: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['DRAFT', 'GENERATING', 'SUCCESS', 'FAILED', 'REVIEWED', 'APPROVED', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true,
    },
    solverStats: {
      conflictsScore: { type: Number, default: 0 },
      solvingDurationMs: { type: Number, default: 0 },
      errorLog: { type: String },
    },
    lockedSlots: [
      {
        dayOfWeek: { type: Number, required: true },
        periodIndex: { type: Number, required: true },
        sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
      },
    ],
    approval: {
      submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      rejectionComment: { type: String, trim: true },
      reviewedAt: Date,
      approvedAt: Date,
      publishedAt: Date,
    },
  },
  { timestamps: true }
);

// Enforce unique versions per school & term
TimetableDraftSchema.index({ schoolId: 1, termId: 1, version: 1 }, { unique: true });

export const TimetableDraft = mongoose.model<ITimetableDraftDocument>('TimetableDraft', TimetableDraftSchema);
export default TimetableDraft;
