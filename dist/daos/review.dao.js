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
Object.defineProperty(exports, "__esModule", { value: true });
const review_schema_1 = require("../models/review.schema");
class ReviewDAO {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createDTO = new review_schema_1.reviewModel(dto);
            return yield createDTO.save();
        });
    }
    getAllMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield review_schema_1.reviewModel.find({}).exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield review_schema_1.reviewModel.findById(id).exec();
        });
    }
    getByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield review_schema_1.reviewModel.find({ senderId: id }).exec();
        });
    }
    getByProductId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield review_schema_1.reviewModel.find({ productId: id }).exec();
        });
    }
    getByFilter(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield review_schema_1.reviewModel.findOne(filter).exec();
        });
    }
    getByFilter1(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield review_schema_1.reviewModel.find(filter).exec();
        });
    }
}
exports.default = ReviewDAO;
//# sourceMappingURL=review.dao.js.map