import mongoose from 'mongoose';
import { RatingReviewDTO } from '../dtos/ratingReview.dto';
import { reviewRatingModel } from '../models/reviewRating.schema';

export default class RatingReviewDAO {

  public async create(dto: RatingReviewDTO): Promise<RatingReviewDTO> {
    const createDTO = new reviewRatingModel(dto);
    return await createDTO.save();
  }

  public async getAllRatingReviews(): Promise<RatingReviewDTO[]> {
    return await reviewRatingModel.find({ deleted: false }).exec();
  }
  public async getById(id: string): Promise<RatingReviewDTO> {
    return await reviewRatingModel.findById(id).exec();
  }
  public async getByUserId(id: string): Promise<RatingReviewDTO[]> {
    return await reviewRatingModel.find({ userId: id, deleted: false }).exec();
  }
  public async getByItemId(id: string): Promise<RatingReviewDTO[]> {
    return await reviewRatingModel.find({ itemId: id, deleted: false }).exec();
  }
  public async update(id: string, dto: RatingReviewDTO): Promise<RatingReviewDTO> {
    const updateDTO = await reviewRatingModel.findById(id).exec();
    Object.assign(updateDTO, dto);
    return await updateDTO.save();
  }
  public async delete(id: string) {
    return reviewRatingModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { deleted: true });
  }

}
