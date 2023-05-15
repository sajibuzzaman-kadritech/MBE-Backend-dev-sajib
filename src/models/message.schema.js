"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const messageSchema = new mongoose_1.default.Schema({
    added: {
        default: moment_1.default.utc().toISOString(),
        required: false,
        type: Date
    },
    senderId: {
        type: String,
        required: false,
    },
    senderName: {
        type: String,
        required: false,
    },
    senderEmail: {
        type: String,
        required: false,
    },
    senderImage: {
        type: String,
        required: false,
    },
    receiverName: {
        type: String,
    },
    receiverImage: {
        type: String,
    },
    receiverId: {
        type: String,
    },
    chat: {},
    accepted: {
        type: Date
    },
    updated: {
        default: moment_1.default.utc().toISOString(),
        required: false,
        type: Date
    },
    endchat: {
        default: moment_1.default.utc().toISOString(),
        required: false,
        type: Date
    },
    status: {
        type: String,
        default: 'New'
    },
    receiverjointime: {
        type: Date
    },
});
exports.messageModel = mongoose_1.default.model('message', messageSchema);
//# sourceMappingURL=message.schema.js.map