import mongoose from 'mongoose';
import AdminsettingsDTO from '../dtos/adminsettings.dto';
import moment from "moment";

const adminsettingsSchema = new mongoose.Schema({
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
  est_delivery: {
    type: Number,
    required: false,
    //default: 'Free Delivery'
  },
  status: {
    type: String,
    default: 'Active'
  }
  
});

export const adminsettingsModel = mongoose.model<AdminsettingsDTO & mongoose.Document>(
  'adminsettings',
  adminsettingsSchema,
);
