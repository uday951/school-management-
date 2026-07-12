import mongoose, { Schema, Document } from 'mongoose';
import { ISubject } from '@mahathi/types';

export interface ISubjectDocument extends Omit<ISubject, '_id'>, Document {}

const SubjectSchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['THEORY', 'PRACTICAL', 'LAB'],
      default: 'THEORY',
      index: true,
    },
    weeklyPeriodCount: { type: Number, required: true, min: 1 },
    maxDailyPeriods: { type: Number, default: 2, min: 1 },
    minDailyPeriods: { type: Number, default: 0, min: 0 },
    doublePeriod: { type: Boolean, default: false },
    triplePeriod: { type: Boolean, default: false },
    isOptional: { type: Boolean, default: false, index: true },
    isElective: { type: Boolean, default: false, index: true },
    isActivitySubject: { type: Boolean, default: false, index: true },
    isArchived: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Unique subject code per school
SubjectSchema.index({ schoolId: 1, code: 1 }, { unique: true });

export const Subject = mongoose.model<ISubjectDocument>('Subject', SubjectSchema);
export default Subject;
