"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const message_schema_1 = require("../models/message.schema");
class MessageDAO {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createDTO = new message_schema_1.messageModel(dto);
            return yield createDTO.save();
        });
    }
    getAllMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message_schema_1.messageModel.find({}).exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message_schema_1.messageModel.findById(id).exec();
        });
    }
    getByTopic(topic) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message_schema_1.messageModel.find({ topic }).exec();
        });
    }
    getByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message_schema_1.messageModel.find({ userId: id }).exec();
        });
    }
    getByMessageId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message_schema_1.messageModel.find({ messageId: id }).exec();
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateDTO = yield message_schema_1.messageModel.findById(id).exec();
            Object.assign(updateDTO, dto);
            return yield updateDTO.save();
        });
    }
    updateC(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message_schema_1.messageModel.updateOne({ _id: mongoose_1.default.Types.ObjectId(id) }, dto).exec();
        });
    }
    getByFilter(filter, filter2) {
        return __awaiter(this, void 0, void 0, function* () {
            if (filter2) {
                return yield message_schema_1.messageModel.findOne(filter, filter2).exec();
            }
            return yield message_schema_1.messageModel.findOne(filter).exec();
        });
    }
    getByFilter1(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message_schema_1.messageModel.find(filter).sort({ _id: -1 }).exec();
        });
    }
}
exports.default = MessageDAO;
//# sourceMappingURL=message.dao.js.map