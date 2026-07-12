import { BaseRepository } from './BaseRepository';
import { Grade, IGradeDocument } from '../models/Grade';

export class GradeRepository extends BaseRepository<IGradeDocument> {
  constructor() {
    super(Grade);
  }
}
