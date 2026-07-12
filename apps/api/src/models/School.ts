import mongoose, { Schema, Document } from 'mongoose';
import { ISchool } from '@mahathi/types';

export interface ISchoolDocument extends Omit<ISchool, '_id'>, Document {}

const SchoolSchema: Schema = new Schema(
  {
    name: { type: String, required: true, index: true },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    subscriptionTier: {
      type: String,
      required: true,
      enum: ['FREE', 'PREMIUM', 'ENTERPRISE'],
      default: 'FREE',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const School = mongoose.model<ISchoolDocument>('School', SchoolSchema);
export default School;
