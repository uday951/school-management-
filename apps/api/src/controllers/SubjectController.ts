import { BaseController } from './BaseController';
import { SubjectRepository } from '../repositories/SubjectRepository';
import { SubjectInputSchema } from '@mahathi/validation';
import { ISubjectDocument } from '../models/Subject';

const subjectRepo = new SubjectRepository();

export class SubjectController extends BaseController<ISubjectDocument> {
  constructor() {
    super(subjectRepo, ['name', 'code', 'type'], SubjectInputSchema);
  }
}
export default SubjectController;
