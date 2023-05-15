"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const deliverySchema = new mongoose_1.default.Schema({
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
    city_name: {
        type: String,
        required: false,
    },
    state_name: {
        type: String,
        required: false,
    },
    zip_code: {
        type: String,
        required: false,
    },
    delivery_type: {
        type: String,
        required: false,
        default: 'Free Delivery'
    },
    status: {
        type: String,
        default: 'Active'
    }
});
exports.deliveryModel = mongoose_1.default.model('delivery', deliverySchema);
//# sourceMappingURL=delivery.schema.js.map