import mongoose from 'mongoose';
import CategoryDTO from '../dtos/category.dto';
import moment from "moment";

const categorySchema = new mongoose.Schema({
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
      required: true,
      type: Date,
    }
  },
  name: {
      type: String,
      default: '',
  },
  images: {
    type: String,
    default: '',
  }, 
  icon: {
    type: String,
    default: '',
  },
  status: {
    default: 'Active',
    type: String
  },
  delete: {
    default: false,
    type: Boolean
  }
});

export const categoryModel = mongoose.model<CategoryDTO & mongoose.Document>(
    'category',
    categorySchema,
  );
