import mongoose from 'mongoose';
import tmcDTO from '../dtos/tmc.dto';
import { tmcModel } from '../models/tmc.schema';

export default class tmcDAO {

  public async create(dto: tmcDTO): Promise<tmcDTO> {
    const createDTO = new tmcModel(dto);
    return await createDTO.save();
  }

  public async getAllMessages(): Promise<tmcDTO[]> {
    return await tmcModel.find({ }).exec();
  }
  public async getById(id: string): Promise<tmcDTO> {
    return await tmcModel.findById(id).exec();
  }
  public async getByTopic(topic: string): Promise<tmcDTO[]> {
    return await tmcModel.find({ topic }).exec();
  }
  public async getByUserId(id: string): Promise<tmcDTO[]> {
    return await tmcModel.find({ userId: id }).exec();
  }
  public async getByMessageId(id: string): Promise<tmcDTO[]> {
    return await tmcModel.find({ messageId: id }).exec();
  }
  public async update(id: string, dto: tmcDTO): Promise<tmcDTO> {
    const updateDTO = await tmcModel.findById(id).exec();
    Object.assign(updateDTO, dto);
    return await updateDTO.save();
  }

  public async updateC(id: string, dto: any): Promise<tmcDTO> {
    return await tmcModel.updateOne({ _id: mongoose.Types.ObjectId(id) }, dto).exec();
  }
  public async getByFilter(filter: object): Promise<tmcDTO> {
    return await tmcModel.findOne(filter).exec();
  }
  public async getByFilter1(filter: object): Promise<tmcDTO[]> {
    return await tmcModel.find(filter).exec();
  }
  
}
