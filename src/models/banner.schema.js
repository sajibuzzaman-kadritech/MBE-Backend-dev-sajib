"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const bannerSchema = new mongoose_1.default.Schema({
    added: {
        at: {
            default: moment_1.default.utc().toISOString(),
            required: false,
            type: Date,
        }
    },
    images: {
        default: [],
        type: Array
    },
    name: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    text: {
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
    },
    bannertype: {
        type: String,
        required: true
    }
});
exports.bannerModel = mongoose_1.default.model('banner', bannerSchema);
//# sourceMappingURL=banner.schema.js.map