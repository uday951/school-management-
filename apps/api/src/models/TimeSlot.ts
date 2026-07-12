import mongoose, { Schema, Document } from 'mongoose';
import { ITimeSlot } from '@mahathi/types';

export interface ITimeSlotDocument extends Omit<ITimeSlot, '_id'>, Document {}

const TimeSlotSchema: Schema = new Schema(
  {
    draftId: { type: Schema.Types.ObjectId, ref: 'TimetableDraft', required: true, index: true },
    dayOfWeek: { type: Number, required: true, min: 1, max: 7, index: true },
    periodIndex: { type: Number, required: true, min: 0, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    sectionIds: [{ type: Schema.Types.ObjectId, ref: 'Section', index: true }],
    batchId: { type: Schema.Types.ObjectId, ref: 'ClassBatch', index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  },
  { timestamps: false }
);

// Enforce unique bookings to prevent double-booking clashing
// 1. Teacher cannot teach twice in the same slot
TimeSlotSchema.index({ draftId: 1, dayOfWeek: 1, periodIndex: 1, teacherId: 1 }, { unique: true });
// 2. Room cannot host twice in the same slot
TimeSlotSchema.index({ draftId: 1, dayOfWeek: 1, periodIndex: 1, classroomId: 1 }, { unique: true });
// 3. Section cannot attend twice in the same slot
TimeSlotSchema.index({ draftId: 1, dayOfWeek: 1, periodIndex: 1, sectionId: 1 }, { unique: true });

export const TimeSlot = mongoose.model<ITimeSlotDocument>('TimeSlot', TimeSlotSchema);
export default TimeSlot;
