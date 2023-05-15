import mongoose from 'mongoose';
import { CartDTO } from '../dtos/cart.dto';
import moment from "moment";

const cartSchema = new mongoose.Schema({
  added: {
    at: {
      default: moment.utc().toISOString(),
      required: false,
      type: Date,
    }
  },
  is_ordered: {
    type: String,
    default: ''
},
  userId: {
      type: String,
      required: true
  },
  items: [{
    itemId: {
        type: String,
        default: ''
    },
    itemName: {
      type: String,
      default: ''
    },
    itemPrice: {
      type: String,
      default: ''
    },
    disCountPrice: {
      type: String,
      default: ''
    },
    itemDeal: {
      type: String,
      default: ''
    },
    itemBrand: {
      type: Object,
      default: null
    },
    itemCategory: {
      type: Object,
      default: null
    },
    itemImages: {},
    quantity: {
      type: Number,
      default: 0
    }
  }],
});

export const cartModel = mongoose.model<CartDTO & mongoose.Document>(
    'cart',
    cartSchema,
  );
