import mongoose from 'mongoose';
import taxDTO from '../dtos/tax.dto';
import moment from "moment";

const taxSchema = new mongoose.Schema({
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
  tax_type: {
    type: String,
    required: false,
    default: 'fixed'
  },
  tax_name: {
    type: String,
    required: false,
    //default: 'Free Delivery'
  },
  tax_value: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    default: 'Active'
  }
  
});

export const taxModel = mongoose.model<taxDTO & mongoose.Document>(
  'tax',
  taxSchema,
);
