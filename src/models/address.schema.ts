import mongoose from 'mongoose';
import AddressDTO from '../dtos/address.dto';
import moment from "moment";

const addressSchema = new mongoose.Schema({
    added: {
        at: {
            default: moment.utc().toISOString(),
            required: false,
            type: Date,
        }
    },
    userId: {
        type: String,
        required: true,
    },
    addressType: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: ''
    },
    addressLine1: {
        type: String,
        default: ''
    },
    addressLine2: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        default: ''
    },
    postalCode: {
        type: String,
        default: ''
    },
    primary: {
        type: Boolean,
        default: false
    }
});

export const addressModel = mongoose.model<AddressDTO & mongoose.Document>(
    'address',
    addressSchema,
);
