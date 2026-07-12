import { BaseController } from './BaseController';
import { ActivityRepository } from '../repositories/ActivityRepository';
import { ActivityInputSchema } from '@mahathi/validation';
import { IActivityDocument } from '../models/Activity';

const activityRepo = new ActivityRepository();

export class ActivityController extends BaseController<IActivityDocument> {
  constructor() {
    super(activityRepo, ['name'], ActivityInputSchema);
  }
}
export default ActivityController;
