import mongoose from 'mongoose';
import DeliveryDTO from '../dtos/delivery.dto';
import { deliveryModel } from '../models/delivery.schema';

export default class DeliveryDAO {

  public async create(dto: DeliveryDTO): Promise<DeliveryDTO> {
    const createDTO = new deliveryModel(dto);
    return await createDTO.save();
  }

  public async getAllMessages(): Promise<DeliveryDTO[]> {
    return await deliveryModel.find({ }).exec();
  }
  public async getById(id: string): Promise<DeliveryDTO> {
    return await deliveryModel.findById(id).exec();
  }
  public async getByTopic(topic: string): Promise<DeliveryDTO[]> {
    return await deliveryModel.find({ topic }).exec();
  }
  public async getByUserId(id: string): Promise<DeliveryDTO[]> {
    return await deliveryModel.find({ userId: id }).exec();
  }
  public async getByMessageId(id: string): Promise<DeliveryDTO[]> {
    return await deliveryModel.find({ messageId: id }).exec();
  }
  public async update(id: string, dto: DeliveryDTO): Promise<DeliveryDTO> {
    const updateDTO = await deliveryModel.findById(id).exec();
    Object.assign(updateDTO, dto);
    return await updateDTO.save();
  }

  public async updateC(id: string, dto: any): Promise<DeliveryDTO> {
    return await deliveryModel.updateOne({ _id: mongoose.Types.ObjectId(id) }, dto).exec();
  }
  public async getByFilter(filter: object): Promise<DeliveryDTO> {
    return await deliveryModel.findOne(filter).exec();
  }
  public async getByFilter1(filter: object): Promise<DeliveryDTO[]> {
    return await deliveryModel.find(filter).exec();
  }
  public async delete(id: string) {
    return deliveryModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) });
}
  
}
