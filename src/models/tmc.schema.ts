import mongoose from 'mongoose';
import tmcDTO from '../dtos/tmc.dto';
import moment from "moment";

const tmcSchema = new mongoose.Schema({
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
  message: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    default: 'Active'
  }
  
});

export const tmcModel = mongoose.model<tmcDTO & mongoose.Document>(
  'tmc',
  tmcSchema,
);
