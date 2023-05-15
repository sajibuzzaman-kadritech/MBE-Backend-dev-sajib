import mongoose from 'mongoose';
import PaymentDTO from '../dtos/payment.dto';
import moment from "moment";

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    default: ''
  },
  cartId: {
      type: String,
      default: ''
  }
}, { strict: false });

export const paymentModel = mongoose.model<PaymentDTO & mongoose.Document>(
  'payments',
  paymentSchema,
);
