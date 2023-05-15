import mongoose from 'mongoose';
import NotificationDTO from '../dtos/notification.dto';
import { notificationModel } from '../models/notification.schema';

export default class NotificationDAO {

  public async create(dto: NotificationDTO): Promise<NotificationDTO> {
    const createDTO = new notificationModel(dto);
    return await createDTO.save();
  }
  public async getAllNotifications(): Promise<NotificationDTO[]> {
    return await notificationModel.find().exec();
}
  public async getById(id: string): Promise<NotificationDTO> {
    return await notificationModel.findById(id).exec();
}
  public async getByItemId(id: string, email: string): Promise<NotificationDTO> {
    return await notificationModel.findOne({ itemId: id, email }).exec();
}
  public async getByUserId(id: string): Promise<NotificationDTO[]> {
    return await notificationModel.find({ userId: id }).exec();
}
  public async update(id: string, dto: NotificationDTO): Promise<NotificationDTO> {
    const updateDTO = await notificationModel.findById(id).exec();
    Object.assign(updateDTO, dto);
    return await updateDTO.save();
  }

}
