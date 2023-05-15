"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealsModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const dealsSchema = new mongoose_1.default.Schema({
    added: {
        at: {
            default: moment_1.default.utc().toISOString(),
            required: false,
            type: Date,
        }
    },
    status: {
        type: String,
        required: true,
        default: 'Not Active'
    },
    images: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        required: true
    },
    forSpecificBrand: {
        type: Boolean,
        required: false
    },
    brandName: {
        type: String
    },
    forSpecificCategory: {
        type: Boolean,
        required: false
    },
    categoryName: {
        type: String,
        required: false
    },
    forSpecificSingle: {
        type: Boolean,
        required: false
    },
    singleName: {
        type: String,
        required: false
    },
    items: {
        type: Array,
        default: [],
        required: false
    }
});
exports.dealsModel = mongoose_1.default.model('deals', dealsSchema);
//# sourceMappingURL=deals.schema.js.map