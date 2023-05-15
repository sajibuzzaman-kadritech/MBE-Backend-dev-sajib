import mongoose from 'mongoose';
import BrandsDTO from '../dtos/brands.dto';
import moment from "moment";

const brandsSchema = new mongoose.Schema({
  added: {
    at: {
      default: moment.utc().toISOString(),
      required: false,
      type: Date,
    }
  },
  updated: {
    at: {
      default: moment.utc().toISOString(),
      required: false,
      type: Date,
    }
  },
  images: {
    type: String,
    default: ''
  },
  name: {
      type: String,
      default: ''
  },
  status: {
    default: 'Not Active',
    type: String
  },
  delete: {
    default: false,
    type: Boolean
  }
});

export const brandsModel = mongoose.model<BrandsDTO & mongoose.Document>(
    'brands',
    brandsSchema,
  );
