"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const taxSchema = new mongoose_1.default.Schema({
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
    tax_type: {
        type: String,
        required: false,
        default: 'fixed'
    },
    tax_name: {
        type: String,
        required: false,
        //default: 'Free Delivery'
    },
    tax_value: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        default: 'Active'
    }
});
exports.taxModel = mongoose_1.default.model('tax', taxSchema);
//# sourceMappingURL=tax.schema.js.map