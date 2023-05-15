"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shippingtaxModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const shippingtaxSchema = new mongoose_1.default.Schema({
    added: {
        default: moment_1.default.utc().toISOString(),
        required: false,
        type: Date
    },
    updated: {
        default: moment_1.default.utc().toISOString(),
        required: false,
        type: Date
    },
    shipping_type: {
        type: String,
        required: false,
        //default: 'Free Delivery'
    },
    shipping_product: {
        type: [String],
        required: false,
        //default: 'Free Delivery'
    },
    shipping_value: {
        type: String,
        required: false,
    },
    shipping_amount_type: {
        type: String,
        required: false,
        default: 'fixed'
    },
    status: {
        type: String,
        default: 'Active'
    }
});
exports.shippingtaxModel = mongoose_1.default.model('shippingtax', shippingtaxSchema);
//# sourceMappingURL=shippingtax.schema.js.map