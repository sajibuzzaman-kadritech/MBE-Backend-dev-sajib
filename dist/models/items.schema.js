"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const itemsSchema = new mongoose_1.default.Schema({
    added: {
        at: {
            default: moment_1.default.utc().toISOString(),
            required: false,
            type: Date,
        }
    },
    updated: {
        at: {
            default: moment_1.default.utc().toISOString(),
            required: false,
            type: Date,
        }
    },
    name: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    brand: {
        type: Object,
        default: null
    },
    category: {
        type: Object,
        default: null
    },
    keyFeatures: {
        type: Array,
        default: []
    },
    specifications: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    shop_price: {
        type: Number,
        default: 0
    },
    disCountPrice: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        default: 0
    },
    images: {
        type: Array,
        default: []
    },
    deal: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'Active'
    },
    rating: {
        type: Number,
        default: 0,
    },
    featured: {
        type: Boolean,
        default: false
    },
    dealofDay: {
        type: Boolean,
        default: false
    }
}, { strict: false });
exports.itemsModel = mongoose_1.default.model('items', itemsSchema);
//# sourceMappingURL=items.schema.js.map