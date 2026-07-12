import { BaseController } from './BaseController';
import { SectionRepository } from '../repositories/SectionRepository';
import { SectionInputSchema } from '@mahathi/validation';
import { ISectionDocument } from '../models/Section';

const sectionRepo = new SectionRepository();

export class SectionController extends BaseController<ISectionDocument> {
  constructor() {
    super(sectionRepo, ['name'], SectionInputSchema);
  }
}
export default SectionController;
