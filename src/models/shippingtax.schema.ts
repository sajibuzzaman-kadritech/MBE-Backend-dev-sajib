import mongoose from 'mongoose';
import ShippingtaxDTO from '../dtos/shippingtax.dto';
import moment from "moment";

const shippingtaxSchema = new mongoose.Schema({
  added: {
    default: moment.utc().toISOString(),
    required: false,
    type: Date
  },
  updated: {
    default: moment.utc().toISOString(),
    required: false,
    type: Date
  },
  shipping_type: {
    type: String,
    required: false,
    //default: 'Free Delivery'
  },
  shipping_product: {
    type: [String],
    required: false,
    //default: 'Free Delivery'
  },
  shipping_value: {
    type: String,
    required: false,
  },
  shipping_amount_type: {
    type: String,
    required: false,
    default: 'fixed'
  },
  status: {
    type: String,
    default: 'Active'
  }
  
});

export const shippingtaxModel = mongoose.model<ShippingtaxDTO & mongoose.Document>(
  'shippingtax',
  shippingtaxSchema,
);
