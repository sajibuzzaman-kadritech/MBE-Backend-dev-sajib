import mongoose from 'mongoose';
import DeliveryDTO from '../dtos/delivery.dto';
import moment from "moment";

const deliverySchema = new mongoose.Schema({
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
  city_name: {
    type: String,
    required: false,
  },
  state_name: {
    type: String,
    required: false,
  },
  zip_code: {
    type: String,
    required: false,
  },
  delivery_type: {
    type: String,
    required: false,
    default: 'Free Delivery'
  },
  status: {
    type: String,
    default: 'Active'
  }
  
});

export const deliveryModel = mongoose.model<DeliveryDTO & mongoose.Document>(
  'delivery',
  deliverySchema,
);
