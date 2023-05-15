import mongoose from 'mongoose';
import MessageDTO from '../dtos/message.dto';
import { messageModel } from '../models/message.schema';

export default class MessageDAO {

  public async create(dto: MessageDTO): Promise<MessageDTO> {
    const createDTO = new messageModel(dto);
    return await createDTO.save();
  }

  public async getAllMessages(): Promise<MessageDTO[]> {
    return await messageModel.find({ }).exec();
  }
  public async getById(id: string): Promise<MessageDTO> {
    return await messageModel.findById(id).exec();
  }
  public async getByTopic(topic: string): Promise<MessageDTO[]> {
    return await messageModel.find({ topic }).exec();
  }
  public async getByUserId(id: string): Promise<MessageDTO[]> {
    return await messageModel.find({ userId: id }).exec();
  }
  public async getByMessageId(id: string): Promise<MessageDTO[]> {
    return await messageModel.find({ messageId: id }).exec();
  }
  public async update(id: string, dto: MessageDTO): Promise<MessageDTO> {
    const updateDTO = await messageModel.findById(id).exec();
    Object.assign(updateDTO, dto);
    return await updateDTO.save();
  }

  public async updateC(id: string, dto: any): Promise<MessageDTO> {
    return await messageModel.updateOne({ _id: mongoose.Types.ObjectId(id) }, dto).exec();
  }
  public async getByFilter(filter: object, filter2?:object): Promise<MessageDTO> {
    if(filter2){
      return await messageModel.findOne(filter, filter2).exec();
    }
    return await messageModel.findOne(filter).exec();
  }
  public async getByFilter1(filter: object): Promise<MessageDTO[]> {
    return await messageModel.find(filter).sort({ _id: -1 }).exec();
  }
}
