import mongoose from 'mongoose';
import CardDTO from '../dtos/card.dto';
import moment from "moment";

const cardSchema = new mongoose.Schema({
    added: {
        at: {
            default: moment.utc().toISOString(),
            required: false,
            type: Date,
        }
    },
    cardnumber: {
        type: String,
        required: true,
    },
    expirymonth: {
        type: String,
        required: true,
    },
    expiryyear: {
        type: String,
        required: true,
    },
    cvv: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true
    },
});
export const cardModel = mongoose.model<CardDTO & mongoose.Document>(
    'cards',
    cardSchema,
);
