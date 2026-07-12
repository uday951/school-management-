import { BaseController } from './BaseController';
import { TeacherRepository } from '../repositories/TeacherRepository';
import { TeacherInputSchema } from '@mahathi/validation';
import { ITeacherDocument } from '../models/Teacher';

const teacherRepo = new TeacherRepository();

export class TeacherController extends BaseController<ITeacherDocument> {
  constructor() {
    super(teacherRepo, ['employeeId', 'department'], TeacherInputSchema);
  }
}
export default TeacherController;
