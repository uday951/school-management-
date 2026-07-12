import mongoose, { Schema, Document } from 'mongoose';
import { IStudent } from '@mahathi/types';

export interface IStudentDocument extends Omit<IStudent, '_id'>, Document {}

const StudentSchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    admissionNumber: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    guardian: {
      name: { type: String, required: true, trim: true },
      relation: { type: String, required: true, trim: true },
      phone: { type: String, required: true },
    },
    electiveIds: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    isArchived: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Unique admission number per school
StudentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true });
// Unique roll number per section
StudentSchema.index({ sectionId: 1, rollNumber: 1 }, { unique: true });

export const Student = mongoose.model<IStudentDocument>('Student', StudentSchema);
export default Student;
