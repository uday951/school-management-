import { BaseController } from './BaseController';
import { StudentRepository } from '../repositories/StudentRepository';
import { StudentInputSchema } from '@mahathi/validation';
import { IStudentDocument } from '../models/Student';

const studentRepo = new StudentRepository();

export class StudentController extends BaseController<IStudentDocument> {
  constructor() {
    super(studentRepo, ['admissionNumber', 'firstName', 'lastName'], StudentInputSchema);
  }
}
export default StudentController;
