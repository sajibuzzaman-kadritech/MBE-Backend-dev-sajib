"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const cartSchema = new mongoose_1.default.Schema({
    added: {
        at: {
            default: moment_1.default.utc().toISOString(),
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
exports.cartModel = mongoose_1.default.model('cart', cartSchema);
//# sourceMappingURL=cart.schema.js.map