import mongoose, { Schema, Document } from 'mongoose';
import { ISection } from '@mahathi/types';

export interface ISectionDocument extends Omit<ISection, '_id'>, Document {}

const SectionSchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true, index: true },
    name: { type: String, required: true, trim: true },
    classTeacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    studentCount: { type: Number, default: 0, min: 0 },
    schoolTimings: {
      workingDays: [{ type: Number }], // [1, 2, 3, 4, 5]
      schoolStart: { type: String, required: true }, // "08:30"
      schoolEnd: { type: String, required: true }, // "15:30"
      periods: [
        {
          name: { type: String, required: true },
          durationMinutes: { type: Number, required: true },
          isBreak: { type: Boolean, default: false },
          isLunch: { type: Boolean, default: false },
        },
      ],
    },
    isArchived: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Enforce unique section names per grade
SectionSchema.index({ gradeId: 1, name: 1 }, { unique: true });

export const Section = mongoose.model<ISectionDocument>('Section', SectionSchema);
export default Section;
