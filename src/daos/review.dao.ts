import mongoose from 'mongoose';
import ReviewDTO from '../dtos/review.dto';
import { reviewModel } from '../models/review.schema';

export default class ReviewDAO {

  public async create(dto: ReviewDTO): Promise<ReviewDTO> {
    const createDTO = new reviewModel(dto);
    return await createDTO.save();
  }

  public async getAllMessages(): Promise<ReviewDTO[]> {
    return await reviewModel.find({ }).exec();
  }
  public async getById(id: string): Promise<ReviewDTO> {
    return await reviewModel.findById(id).exec();
  }
 
  public async getByUserId(id: string): Promise<ReviewDTO[]> {
    return await reviewModel.find({ senderId: id }).exec();
  }
  public async getByProductId(id: string): Promise<ReviewDTO[]> {
    return await reviewModel.find({ productId: id }).exec();
  }
  
  public async getByFilter(filter: object): Promise<ReviewDTO> {
    return await reviewModel.findOne(filter).exec();
  }
  public async getByFilter1(filter: object): Promise<ReviewDTO[]> {
    return await reviewModel.find(filter).exec();
  }
}
