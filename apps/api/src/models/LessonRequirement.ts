import mongoose, { Schema, Document } from 'mongoose';
import { ILessonRequirement } from '@mahathi/types';

export interface ILessonRequirementDocument extends Omit<ILessonRequirement, '_id'>, Document {}

const LessonRequirementSchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    periodsPerWeek: { type: Number, required: true, min: 1 },
    preferredRoomTag: { type: String, default: 'CLASSROOM' },
    doublePeriodRequirement: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Enforce unique teacher or section constraints per subject requirement
LessonRequirementSchema.index({ sectionId: 1, subjectId: 1, teacherId: 1 }, { unique: true });

export const LessonRequirement = mongoose.model<ILessonRequirementDocument>('LessonRequirement', LessonRequirementSchema);
export default LessonRequirement;
