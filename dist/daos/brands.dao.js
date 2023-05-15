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
const brands_schema_1 = require("../models/brands.schema");
class BrandsDAO {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createDTO = new brands_schema_1.brandsModel(dto);
            return yield createDTO.save();
        });
    }
    getActiveBrands() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield brands_schema_1.brandsModel.find({ status: 'Active', delete: false }).exec();
        });
    }
    getAllBrands() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield brands_schema_1.brandsModel.find({ delete: false }).exec();
        });
    }
    find(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield brands_schema_1.brandsModel.find(filter).exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield brands_schema_1.brandsModel.findById(id).exec();
        });
    }
    getByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield brands_schema_1.brandsModel.findOne({ name: name }).exec();
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateDTO = yield brands_schema_1.brandsModel.findById(id).exec();
            Object.assign(updateDTO, dto);
            return yield updateDTO.save();
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return brands_schema_1.brandsModel.findOneAndDelete({ _id: mongoose_1.default.Types.ObjectId(id) });
        });
    }
    statusChange(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (params.status === 'Active') {
                return brands_schema_1.brandsModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { status: 'Not Active' });
            }
            return brands_schema_1.brandsModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { status: 'Active' });
        });
    }
}
exports.default = BrandsDAO;
//# sourceMappingURL=brands.dao.js.map