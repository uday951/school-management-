import { BaseController } from './BaseController';
import { RoomRepository } from '../repositories/RoomRepository';
import { RoomInputSchema } from '@mahathi/validation';
import { IRoomDocument } from '../models/Room';

const roomRepo = new RoomRepository();

export class RoomController extends BaseController<IRoomDocument> {
  constructor() {
    super(roomRepo, ['name', 'type'], RoomInputSchema);
  }
}
export default RoomController;
