import mongoose from 'mongoose';
import BannerDTO from '../dtos/homePageBanner.dto';
import moment from "moment";

const bannerSchema = new mongoose.Schema({
  added: {
    at: {
      default: moment.utc().toISOString(),
      required: false,
      type: Date,
    }
  },
  images: {
    default: [],
    type: Array
  },
  name: {
      type: String,
      default: ''
  },
  description: {
      type: String,
      default: ''
  },
  text: {
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
  },
  bannertype: {
    type: String,
    required: true
  }
});

export const bannerModel = mongoose.model<BannerDTO & mongoose.Document>(
    'banner',
    bannerSchema,
  );
