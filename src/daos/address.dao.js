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
const address_schema_1 = require("../models/address.schema");
class AddressDAO {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createDTO = new address_schema_1.addressModel(dto);
            return yield createDTO.save();
        });
    }
    getPrimaryAddressForUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield address_schema_1.addressModel.findOne({ userId: id, primary: true }).exec();
        });
    }
    getByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield address_schema_1.addressModel.find({ userId: id }).exec();
        });
    }
    getAllAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield address_schema_1.addressModel.find({}).exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield address_schema_1.addressModel.findById(id).exec();
        });
    }
    getByIds(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield address_schema_1.addressModel.find(filter).exec();
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateDTO = yield address_schema_1.addressModel.findById(id).exec();
            Object.assign(updateDTO, dto);
            return yield updateDTO.save();
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return address_schema_1.addressModel.findOneAndDelete({ _id: mongoose_1.default.Types.ObjectId(id) });
        });
    }
    setPrimary(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield address_schema_1.addressModel.findOneAndUpdate({ primary: true }, { primary: false }).exec();
            return address_schema_1.addressModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { primary: true });
        });
    }
}
exports.default = AddressDAO;
//# sourceMappingURL=address.dao.js.map