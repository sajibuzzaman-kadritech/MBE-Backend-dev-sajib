import mongoose from 'mongoose';
import ShippingDTO from '../dtos/shippingtax.dto';
import { shippingtaxModel } from '../models/shippingtax.schema';

export default class ShippingtaxDAO {

  public async create(dto: ShippingDTO): Promise<ShippingDTO> {
    const createDTO = new shippingtaxModel(dto);
    return await createDTO.save();
  }

  public async getAllMessages(): Promise<ShippingDTO[]> {
    return await shippingtaxModel.find({ }).exec();
  }
  public async getById(id: string): Promise<ShippingDTO> {
    return await shippingtaxModel.findById(id).exec();
  }
  public async getByTopic(topic: string): Promise<ShippingDTO[]> {
    return await shippingtaxModel.find({ topic }).exec();
  }
  public async getByUserId(id: string): Promise<ShippingDTO[]> {
    return await shippingtaxModel.find({ userId: id }).exec();
  }
  public async getByMessageId(id: string): Promise<ShippingDTO[]> {
    return await shippingtaxModel.find({ messageId: id }).exec();
  }
  public async update(id: string, dto: ShippingDTO): Promise<ShippingDTO> {
    const updateDTO = await shippingtaxModel.findById(id).exec();
    Object.assign(updateDTO, dto);
    return await updateDTO.save();
  }
  public async delete(id: string) {
    return shippingtaxModel.remove({ _id: mongoose.Types.ObjectId(id) }).exec();;
  }

  public async updateC(id: string, dto: any): Promise<ShippingDTO> {
    return await shippingtaxModel.updateOne({ _id: mongoose.Types.ObjectId(id) }, dto).exec();
  }
  public async getByFilter(filter: object): Promise<ShippingDTO> {
    return await shippingtaxModel.findOne(filter).exec();
  }
  public async getByFilter1(filter: object): Promise<ShippingDTO[]> {
    return await shippingtaxModel.find(filter).sort({_id:-1}).limit(0).skip(0);
  }
  
}
