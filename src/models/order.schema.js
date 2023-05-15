"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const orderSchema = new mongoose_1.default.Schema({
    orderplaced: {
        at: {
            default: moment_1.default.utc().toISOString(),
            required: false,
            type: Date,
        },
    },
    updated: {
        at: {
            default: moment_1.default.utc().toISOString(),
            required: false,
            type: Date,
        },
    },
    paymentId: {
        type: String,
        default: '',
    },
    cartId: {
        type: String,
        default: '',
    },
    userId: {
        type: String,
        default: '',
    },
    paymentsDetails: {
        taxAmount: {
            type: Number,
            default: 0,
        },
        shippingCharges: {
            type: Number,
            default: 0,
        },
        totalCharges: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            default: 'NGN',
        },
        profitTotal: {
            type: Number,
            default: 0,
        },
    },
    shippingId: {
        type: String,
        default: '',
    },
    transactionId: {
        type: String,
        default: '',
    },
    paymentType: {
        type: String,
        default: '',
    },
    orderStatus: {
        type: String,
        default: 'Pending',
    },
    paymentStatus: {
        type: String,
        default: 'Pending',
    },
    ordershipped: {
        at: {
            default: moment_1.default.utc().toISOString(),
            required: false,
            type: Date,
        },
    },
    orderdelivered: {
        at: {
            default: moment_1.default.utc().toISOString(),
            required: false,
            type: Date,
        },
    },
    ordercancelled: {
        at: {
            default: moment_1.default.utc().toISOString(),
            required: false,
            type: Date,
        },
    },
    cancellationReason: {
        type: String,
        default: '',
    },
    shippingCourierId: {
        type: String,
        default: '',
    },
    pos: {
        type: Boolean,
        required: false,
        default: false,
    },
    items: {
        type: Array,
        required: false,
        default: [],
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
}, { strict: false });
exports.orderModel = mongoose_1.default.model('orders', orderSchema);
//# sourceMappingURL=order.schema.js.map