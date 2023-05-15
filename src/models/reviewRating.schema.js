"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRatingModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const reviewRatingSchema = new mongoose_1.default.Schema({
    added: {
        at: {
            default: moment_1.default.utc().toISOString(),
            required: false,
            type: Date,
        }
    },
    itemId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    review: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 0,
    },
    deleted: {
        type: Boolean,
        default: false
    }
});
exports.reviewRatingModel = mongoose_1.default.model('ratingReview', reviewRatingSchema);
//# sourceMappingURL=reviewRating.schema.js.map