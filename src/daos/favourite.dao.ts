import mongoose from 'mongoose';
import FavouriteDTO from '../dtos/favourite.dto';
import { favouriteModel } from '../models/favourite.schema';

export default class FavouriteDAO {

  public async create(dto: FavouriteDTO): Promise<FavouriteDTO> {
    const createDTO = new favouriteModel(dto);
    return await createDTO.save();
  }
  public async getAllFavItems(): Promise<FavouriteDTO[]> {
      return await favouriteModel.find({ delete: false }).exec();
  }
  public async getById(id: string): Promise<FavouriteDTO> {
    return await favouriteModel.findById(id).exec();
}
  public async getByUserId(id: string): Promise<FavouriteDTO[]> {
    return await favouriteModel.find({ userId: id }).exec();
}
  public async getByItemId(id: string): Promise<FavouriteDTO[]> {
    return await favouriteModel.find({ itemIds: id }).exec();
}
  public async getByItemUserId(id: string, uid: string): Promise<FavouriteDTO> {
    return await favouriteModel.findOne({ itemIds: id, userId: uid }).exec();
}
  public async update(id: string, uid: string): Promise<FavouriteDTO> {
    return await favouriteModel.findOneAndRemove({ itemIds: id, userId: uid }).exec();
  }
}
