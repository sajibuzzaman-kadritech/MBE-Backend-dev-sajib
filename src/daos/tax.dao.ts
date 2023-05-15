import mongoose from 'mongoose';
import taxDTO from '../dtos/tax.dto';
import { taxModel } from '../models/tax.schema';

export default class taxDAO {

  public async create(dto: taxDTO): Promise<taxDTO> {
    const createDTO = new taxModel(dto);
    return await createDTO.save();
  }

  public async getAllMessages(): Promise<taxDTO[]> {
    return await taxModel.find({ }).exec();
  }
  public async getById(id: string): Promise<taxDTO> {
    return await taxModel.findById(id).exec();
  }
  public async getByTopic(topic: string): Promise<taxDTO[]> {
    return await taxModel.find({ topic }).exec();
  }
  public async getByUserId(id: string): Promise<taxDTO[]> {
    return await taxModel.find({ userId: id }).exec();
  }
  public async getByMessageId(id: string): Promise<taxDTO[]> {
    return await taxModel.find({ messageId: id }).exec();
  }
  public async update(id: string, dto: taxDTO): Promise<taxDTO> {
    const updateDTO = await taxModel.findById(id).exec();
    Object.assign(updateDTO, dto);
    return await updateDTO.save();
  }
  public async delete(id: string) {
    return taxModel.remove({ _id: mongoose.Types.ObjectId(id) }).exec();;
  }

  public async updateC(id: string, dto: any): Promise<taxDTO> {
    return await taxModel.updateOne({ _id: mongoose.Types.ObjectId(id) }, dto).exec();
  }
  public async getByFilter(filter: object): Promise<taxDTO> {
    return await taxModel.findOne(filter).exec();
  }
  public async getByFilter1(filter: object): Promise<taxDTO[]> {
    return await taxModel.find(filter).sort({_id:-1}).limit(0).skip(0);;;
  }
  
}
