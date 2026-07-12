import mongoose, { Schema, Document } from 'mongoose';
import { ITeacher } from '@mahathi/types';

export interface ITeacherDocument extends Omit<ITeacher, '_id'>, Document {}

const TeacherSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    employeeId: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true, index: true },
    qualifications: [{ type: String }],
    experienceYears: { type: Number, default: 0, min: 0 },
    maxDailyLoad: { type: Number, default: 6, min: 1 },
    maxWeeklyLoad: { type: Number, default: 30, min: 1 },
    preferences: {
      morningOnly: { type: Boolean, default: false },
      afternoonOnly: { type: Boolean, default: false },
      preferredPeriods: [
        {
          dayOfWeek: { type: Number },
          periodIndex: { type: Number },
        },
      ],
      unavailablePeriods: [
        {
          dayOfWeek: { type: Number },
          periodIndex: { type: Number },
        },
      ],
    },
    leaveRequests: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String, required: true },
        status: {
          type: String,
          enum: ['PENDING', 'APPROVED', 'REJECTED'],
          default: 'PENDING',
        },
      },
    ],
    isPartTime: { type: Boolean, default: false, index: true },
    isShared: { type: Boolean, default: false, index: true },
    isArchived: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Unique employeeId per school
TeacherSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });

export const Teacher = mongoose.model<ITeacherDocument>('Teacher', TeacherSchema);
export default Teacher;
