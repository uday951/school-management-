import mongoose, { Schema, Document } from 'mongoose';
import { IAcademicYear } from '@mahathi/types';

export interface IAcademicYearDocument extends Omit<IAcademicYear, '_id'>, Document {}

const AcademicYearSchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Enforce unique academic year names per school
AcademicYearSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const AcademicYear = mongoose.model<IAcademicYearDocument>('AcademicYear', AcademicYearSchema);
export default AcademicYear;
