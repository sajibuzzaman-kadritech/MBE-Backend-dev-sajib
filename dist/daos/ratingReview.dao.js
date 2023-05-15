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
const reviewRating_schema_1 = require("../models/reviewRating.schema");
class RatingReviewDAO {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createDTO = new reviewRating_schema_1.reviewRatingModel(dto);
            return yield createDTO.save();
        });
    }
    getAllRatingReviews() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield reviewRating_schema_1.reviewRatingModel.find({ deleted: false }).exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield reviewRating_schema_1.reviewRatingModel.findById(id).exec();
        });
    }
    getByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield reviewRating_schema_1.reviewRatingModel.find({ userId: id, deleted: false }).exec();
        });
    }
    getByItemId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield reviewRating_schema_1.reviewRatingModel.find({ itemId: id, deleted: false }).exec();
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateDTO = yield reviewRating_schema_1.reviewRatingModel.findById(id).exec();
            Object.assign(updateDTO, dto);
            return yield updateDTO.save();
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return reviewRating_schema_1.reviewRatingModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { deleted: true });
        });
    }
}
exports.default = RatingReviewDAO;
//# sourceMappingURL=ratingReview.dao.js.map