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
const shippingtax_schema_1 = require("../models/shippingtax.schema");
class ShippingtaxDAO {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createDTO = new shippingtax_schema_1.shippingtaxModel(dto);
            return yield createDTO.save();
        });
    }
    getAllMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield shippingtax_schema_1.shippingtaxModel.find({}).exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield shippingtax_schema_1.shippingtaxModel.findById(id).exec();
        });
    }
    getByTopic(topic) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield shippingtax_schema_1.shippingtaxModel.find({ topic }).exec();
        });
    }
    getByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield shippingtax_schema_1.shippingtaxModel.find({ userId: id }).exec();
        });
    }
    getByMessageId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield shippingtax_schema_1.shippingtaxModel.find({ messageId: id }).exec();
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateDTO = yield shippingtax_schema_1.shippingtaxModel.findById(id).exec();
            Object.assign(updateDTO, dto);
            return yield updateDTO.save();
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return shippingtax_schema_1.shippingtaxModel.remove({ _id: mongoose_1.default.Types.ObjectId(id) }).exec();
            ;
        });
    }
    updateC(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield shippingtax_schema_1.shippingtaxModel.updateOne({ _id: mongoose_1.default.Types.ObjectId(id) }, dto).exec();
        });
    }
    getByFilter(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield shippingtax_schema_1.shippingtaxModel.findOne(filter).exec();
        });
    }
    getByFilter1(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield shippingtax_schema_1.shippingtaxModel.find(filter).sort({ _id: -1 }).limit(0).skip(0);
        });
    }
}
exports.default = ShippingtaxDAO;
//# sourceMappingURL=shippingtax.dao.js.map