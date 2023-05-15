"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const notificationSchema = new mongoose_1.default.Schema({
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
        default: 'Pending'
    },
    name: {
        type: String,
        required: false,
        default: ''
    },
    type: {
        type: String,
        required: true,
        default: ''
    },
    email: {
        type: String,
        required: false,
        default: ''
    },
    message: {
        type: String,
        required: true,
        default: ''
    },
    itemId: {
        type: String,
        default: ''
    },
    item: {
        type: String,
        default: ''
    },
    userId: {
        type: String,
        required: true,
        default: ''
    }
});
exports.notificationModel = mongoose_1.default.model('notifications', notificationSchema);
//# sourceMappingURL=notification.schema.js.map