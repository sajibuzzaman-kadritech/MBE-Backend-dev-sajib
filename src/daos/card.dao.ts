import mongoose from 'mongoose';
import CardDTO from '../dtos/card.dto';
import { cardModel } from '../models/card.schema';

export default class CardDAO {

  public async create(dto: CardDTO): Promise<CardDTO> {
    const createDTO = new cardModel(dto);
    return await createDTO.save();
  }
  public async getAllUsersCards(): Promise<CardDTO[]> {
      return await cardModel.find().exec();
  }
  public async getCardByUserId(id: string): Promise<CardDTO> {
    return await cardModel.findOne({ userId: id }).exec();
}
  public async getById(id: string): Promise<CardDTO> {
    return await cardModel.findById(id).exec();
  }
  public async update(id: string, dto: CardDTO): Promise<CardDTO> {
    const updateDTO = await cardModel.findById(id).exec();
    Object.assign(updateDTO, dto);
    return await updateDTO.save();
  }
  public async delete(id: string) {
    return cardModel.deleteOne({ _id: mongoose.Types.ObjectId(id) });
  }
  public async deleteByUserId(id: string) {
    return cardModel.deleteOne({ userId: id });
  }
}
