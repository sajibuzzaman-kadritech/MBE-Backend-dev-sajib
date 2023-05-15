import mongoose from 'mongoose';
import DealsDTO from '../dtos/deals.dto';
import { dealsModel } from '../models/deals.schema';

export default class DealsDAO {

  public async create(dto: DealsDTO): Promise<DealsDTO> {
    const createDTO = new dealsModel(dto);
    return await createDTO.save();
  }
  public async getAllDeals(): Promise<DealsDTO[]> {
    return await dealsModel.find({ }).exec();
  }
  public async getActiveDeals(): Promise<DealsDTO[]> {
    return await dealsModel.find({ status: 'Active' }).exec();
  }
  public async getById(id: string): Promise<DealsDTO> {
    return await dealsModel.findById(id).exec();
  }
  public async getByName(name: string): Promise<DealsDTO> {
    return await dealsModel.findOne({name: name}).exec();
  }
  public async update(id: string, dto: any): Promise<DealsDTO> {
    const updateDTO = await dealsModel.findById(id).exec();
    Object.assign(updateDTO, dto);
    return await updateDTO.save();
  }

  public async find(filterObj : any) {
    return dealsModel.find(filterObj);
  }
  public async delete(id: string) {
    return dealsModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(id)});
  }
  public async statusChange(id: string, params: any) {
    if (params.status === 'Active') {
      return dealsModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { status: 'Not Active' });
    }
    return dealsModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { status: 'Active' });
  }
}
