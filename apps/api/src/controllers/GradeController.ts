import { BaseController } from './BaseController';
import { GradeRepository } from '../repositories/GradeRepository';
import { GradeInputSchema } from '@mahathi/validation';
import { IGradeDocument } from '../models/Grade';

const gradeRepo = new GradeRepository();

export class GradeController extends BaseController<IGradeDocument> {
  constructor() {
    super(gradeRepo, ['name'], GradeInputSchema);
  }
}
export default GradeController;
