import mongoose from 'mongoose';
import AdminsettingsDTO from '../dtos/adminsettings.dto';
import { adminsettingsModel } from '../models/adminsettings.schema';

export default class AdminsettingsDAO {

  public async create(dto: AdminsettingsDTO): Promise<AdminsettingsDTO> {
    const createDTO = new adminsettingsModel(dto);
    return await createDTO.save();
  }

  public async getAllMessages(): Promise<AdminsettingsDTO[]> {
    return await adminsettingsModel.find({ }).exec();
  }
  public async getById(id: string): Promise<AdminsettingsDTO> {
    return await adminsettingsModel.findById(id).exec();
  }
  public async getByTopic(topic: string): Promise<AdminsettingsDTO[]> {
    return await adminsettingsModel.find({ topic }).exec();
  }
  public async getByUserId(id: string): Promise<AdminsettingsDTO[]> {
    return await adminsettingsModel.find({ userId: id }).exec();
  }
  public async getByMessageId(id: string): Promise<AdminsettingsDTO[]> {
    return await adminsettingsModel.find({ messageId: id }).exec();
  }
  public async update(id: string, dto: AdminsettingsDTO): Promise<AdminsettingsDTO> {
    const updateDTO = await adminsettingsModel.findById(id).exec();
    Object.assign(updateDTO, dto);
    return await updateDTO.save();
  }

  public async updateC(id: string, dto: any): Promise<AdminsettingsDTO> {
    return await adminsettingsModel.updateOne({ _id: mongoose.Types.ObjectId(id) }, dto).exec();
  }
  public async getByFilter(filter: object): Promise<AdminsettingsDTO> {
    return await adminsettingsModel.findOne(filter).exec();
  }
  public async getByFilter1(filter: object): Promise<AdminsettingsDTO[]> {
    return await adminsettingsModel.find(filter).exec();
  }
  
}
