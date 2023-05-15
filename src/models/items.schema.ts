import mongoose from 'mongoose';
import ItemsDTO from '../dtos/items.dto';
import moment from "moment";

const itemsSchema = new mongoose.Schema({
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
  name: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  brand: {
    type: Object,
    default: null
  },
  category: {
    type: Object,
    default: null
  },
  keyFeatures: {
    type: Array,
    default: []
  },
  specifications: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  shop_price: {
    type: Number,
    default: 0
  },
  disCountPrice: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 0
  },
  images: {
    type: Array,
    default: []
  },
  deal: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'Active'
  },
  rating: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false
  },
  dealofDay: {
    type: Boolean,
    default: false
  }
}, { strict: false });

export const itemsModel = mongoose.model<ItemsDTO & mongoose.Document>(
  'items',
  itemsSchema,
);
