"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const paymentSchema = new mongoose_1.default.Schema({
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
    amount: {
        type: String,
        default: ''
    },
    currency: {
        type: String,
        default: ''
    },
    userId: {
        type: String,
        default: ''
    },
    cartId: {
        type: String,
        default: ''
    }
}, { strict: false });
exports.paymentModel = mongoose_1.default.model('payments', paymentSchema);
//# sourceMappingURL=payment.schema.js.map