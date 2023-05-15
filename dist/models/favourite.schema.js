"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.favouriteModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const favouriteSchema = new mongoose_1.default.Schema({
    added: {
        at: {
            default: moment_1.default.utc().toISOString(),
            required: false,
            type: Date,
        }
    },
    itemIds: {
        type: String
    },
    userId: {
        type: String,
        required: true,
    }
});
exports.favouriteModel = mongoose_1.default.model('favourite', favouriteSchema);
//# sourceMappingURL=favourite.schema.js.map