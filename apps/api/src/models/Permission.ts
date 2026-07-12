import mongoose, { Schema, Document } from 'mongoose';
import { IPermission } from '@mahathi/types';

export interface IPermissionDocument extends Omit<IPermission, '_id'>, Document {}

const PermissionSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    module: { type: String, required: true },
  },
  { timestamps: true }
);

export const Permission = mongoose.model<IPermissionDocument>('Permission', PermissionSchema);
export default Permission;
