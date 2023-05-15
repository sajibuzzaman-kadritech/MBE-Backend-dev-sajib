"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminsettingsModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const adminsettingsSchema = new mongoose_1.default.Schema({
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
    est_delivery: {
        type: Number,
        required: false,
        //default: 'Free Delivery'
    },
    status: {
        type: String,
        default: 'Active'
    }
});
exports.adminsettingsModel = mongoose_1.default.model('adminsettings', adminsettingsSchema);
//# sourceMappingURL=adminsettings.schema.js.map