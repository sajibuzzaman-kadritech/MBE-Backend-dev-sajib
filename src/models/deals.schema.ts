import mongoose from 'mongoose';
import DealsDTO from '../dtos/deals.dto';
import moment from "moment";

const dealsSchema = new mongoose.Schema({
  added: {
    at: {
      default: moment.utc().toISOString(),
      required: false,
      type: Date,
    }
  },
  status: {
      type: String,
      required: true,
      default: 'Not Active'
  },
  images: {
    type: String,
    default: ''
  },
  name: {
      type: String,
      required: true
  },
  forSpecificBrand: {
    type: Boolean,
    required: false
  },
  brandName: {
      type: String
  },
  forSpecificCategory: {
    type: Boolean,
    required: false
  },
  categoryName: {
    type: String,
    required: false
  },
  forSpecificSingle: {
    type: Boolean,
    required: false
  },
  singleName: {
    type: String,
    required: false
  },
  items: {
    type: Array,
    default: [],
    required: false
  }
});

export const dealsModel = mongoose.model<DealsDTO & mongoose.Document>(
    'deals',
    dealsSchema,
  );
