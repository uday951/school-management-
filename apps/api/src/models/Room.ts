import mongoose, { Schema, Document } from 'mongoose';
import { IRoom } from '@mahathi/types';

export interface IRoomDocument extends Omit<IRoom, '_id'>, Document {}

const RoomSchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    buildingId: { type: Schema.Types.ObjectId, ref: 'Building', index: true },
    floorId: { type: Schema.Types.ObjectId, ref: 'Floor', index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['CLASSROOM', 'SCIENCE_LAB', 'COMPUTER_LAB', 'LANGUAGE_LAB', 'LIBRARY', 'AUDITORIUM', 'GROUND', 'SPORTS_AREA'],
      index: true,
    },
    capacity: { type: Number, required: true, min: 1 },
    resourceTags: [{ type: String }],
    availabilityConstraints: [
      {
        dayOfWeek: { type: Number, min: 1, max: 7 },
        periodIndex: { type: Number, min: 0 },
      },
    ],
    isArchived: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Enforce unique room names per school
RoomSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const Room = mongoose.model<IRoomDocument>('Room', RoomSchema);
export default Room;
