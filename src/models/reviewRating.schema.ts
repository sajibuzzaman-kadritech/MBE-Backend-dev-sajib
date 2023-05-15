import mongoose from 'mongoose';
import {RatingReviewDTO} from '../dtos/ratingReview.dto';
import moment from "moment";

const reviewRatingSchema = new mongoose.Schema({
  added: {
    at: {
      default: moment.utc().toISOString(),
      required: false,
      type: Date,
    }
  },
  itemId: {
    type: String,
    required: true,
  },
  userId: {
      type: String,
      required: true,
  },
  review: {
      type: String,
      default: ''
  },
  rating: {
      type: Number,
      default: 0,
  },
  deleted: {
      type: Boolean,
      default: false
  }
});

export const reviewRatingModel = mongoose.model<RatingReviewDTO & mongoose.Document>(
    'ratingReview',
    reviewRatingSchema,
  );
