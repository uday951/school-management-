import { BaseRepository } from './BaseRepository';
import { Room, IRoomDocument } from '../models/Room';

export class RoomRepository extends BaseRepository<IRoomDocument> {
  constructor() {
    super(Room);
  }
}
