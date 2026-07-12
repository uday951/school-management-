import { BaseRepository } from './BaseRepository';
import { Subject, ISubjectDocument } from '../models/Subject';

export class SubjectRepository extends BaseRepository<ISubjectDocument> {
  constructor() {
    super(Subject);
  }
}
