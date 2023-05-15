import mongoose from 'mongoose';
import FavouriteDTO from '../dtos/favourite.dto';
import moment from "moment";

const favouriteSchema = new mongoose.Schema({
  added: {
    at: {
      default: moment.utc().toISOString(),
      required: false,
      type: Date,
    }
  },
  itemIds: {
    type: String
},
  userId: {
      type: String,
      required: true,
  }
});

export const favouriteModel = mongoose.model<FavouriteDTO & mongoose.Document>(
    'favourite',
    favouriteSchema,
  );
