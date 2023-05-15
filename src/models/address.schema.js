"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const addressSchema = new mongoose_1.default.Schema({
    added: {
        at: {
            default: moment_1.default.utc().toISOString(),
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
exports.addressModel = mongoose_1.default.model('address', addressSchema);
//# sourceMappingURL=address.schema.js.map