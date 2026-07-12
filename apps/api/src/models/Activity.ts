import mongoose, { Schema, Document } from 'mongoose';
import { IActivity } from '@mahathi/types';

export interface IActivityDocument extends Omit<IActivity, '_id'>, Document {}

const ActivitySchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: {
      type: String,
      required: true,
      enum: ['SPORTS', 'YOGA', 'KARATE', 'DANCE', 'MUSIC', 'ART', 'ROBOTICS', 'SWIMMING', 'TABLE_TENNIS', 'SKATING'],
      index: true,
    },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    allowedDays: [{ type: Number }], // e.g. [1, 3, 5]
    allowedSessions: [{ type: String }], // ["MORNING", "AFTERNOON"]
    maxDailyClasses: { type: Number, default: 2, min: 1 },
    isArchived: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Enforce unique activity names per school
ActivitySchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const Activity = mongoose.model<IActivityDocument>('Activity', ActivitySchema);
export default Activity;
