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
const card_schema_1 = require("../models/card.schema");
class CardDAO {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createDTO = new card_schema_1.cardModel(dto);
            return yield createDTO.save();
        });
    }
    getAllUsersCards() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield card_schema_1.cardModel.find().exec();
        });
    }
    getCardByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield card_schema_1.cardModel.findOne({ userId: id }).exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield card_schema_1.cardModel.findById(id).exec();
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateDTO = yield card_schema_1.cardModel.findById(id).exec();
            Object.assign(updateDTO, dto);
            return yield updateDTO.save();
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return card_schema_1.cardModel.deleteOne({ _id: mongoose_1.default.Types.ObjectId(id) });
        });
    }
    deleteByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return card_schema_1.cardModel.deleteOne({ userId: id });
        });
    }
}
exports.default = CardDAO;
//# sourceMappingURL=card.dao.js.map