"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandsModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const brandsSchema = new mongoose_1.default.Schema({
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
    images: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    status: {
        default: 'Not Active',
        type: String
    },
    delete: {
        default: false,
        type: Boolean
    }
});
exports.brandsModel = mongoose_1.default.model('brands', brandsSchema);
//# sourceMappingURL=brands.schema.js.map