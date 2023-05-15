import mongoose from 'mongoose';
import ReviewDTO from '../dtos/review.dto';
import moment from "moment";

const reviewSchema = new mongoose.Schema({
  added: {
    default: moment.utc().toISOString(),
    required: false,
    type: Date
  },
  senderId: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  rating: {
    type: String,
    required: true,
  },
  updated: {
    default: moment.utc().toISOString(),
    required: false,
    type: Date
  },
  status: {
    type: String,
    default: 'Active'
  },
 
});

export const reviewModel = mongoose.model<ReviewDTO & mongoose.Document>(
  'review',
  reviewSchema,
);
