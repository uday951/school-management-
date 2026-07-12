import mongoose, { Schema, Document } from 'mongoose';
import { IGrade } from '@mahathi/types';

export interface IGradeDocument extends Omit<IGrade, '_id'>, Document {}

const GradeSchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: { type: String, required: true, trim: true },
    isArchived: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Unique grade names per school
GradeSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const Grade = mongoose.model<IGradeDocument>('Grade', GradeSchema);
export default Grade;
