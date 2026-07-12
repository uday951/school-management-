import mongoose, { Schema, Document } from 'mongoose';
import { IRole } from '@mahathi/types';

export interface IRoleDocument extends Omit<IRole, '_id'>, Document {}

const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'COORDINATOR', 'TEACHER', 'STUDENT'],
      index: true,
    },
    description: { type: String, required: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
  },
  { timestamps: true }
);

export const Role = mongoose.model<IRoleDocument>('Role', RoleSchema);
export default Role;
