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
const banner_schema_1 = require("../models/banner.schema");
class BannerDAO {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createDTO = new banner_schema_1.bannerModel(dto);
            return yield createDTO.save();
        });
    }
    getActiveBanners(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield banner_schema_1.bannerModel.find(filter).exec();
        });
    }
    getAllBanners() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield banner_schema_1.bannerModel.find({ delete: false }).exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield banner_schema_1.bannerModel.findById(id).exec();
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateDTO = yield banner_schema_1.bannerModel.findById(id).exec();
            Object.assign(updateDTO, dto);
            return yield updateDTO.save();
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return banner_schema_1.bannerModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { delete: true, status: 'Not Active' });
        });
    }
    statusChange(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (params.status === 'Active') {
                return banner_schema_1.bannerModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { status: 'Not Active' });
            }
            return banner_schema_1.bannerModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { status: 'Active' });
        });
    }
}
exports.default = BannerDAO;
//# sourceMappingURL=homePageBanner.dao.js.map