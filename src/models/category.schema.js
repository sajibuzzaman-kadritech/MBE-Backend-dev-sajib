"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const categorySchema = new mongoose_1.default.Schema({
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
            required: true,
            type: Date,
        }
    },
    name: {
        type: String,
        default: '',
    },
    images: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    status: {
        default: 'Active',
        type: String
    },
    delete: {
        default: false,
        type: Boolean
    }
});
exports.categoryModel = mongoose_1.default.model('category', categorySchema);
//# sourceMappingURL=category.schema.js.map