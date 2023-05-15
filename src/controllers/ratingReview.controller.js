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
exports.RatingReview = void 0;
const ratingReview_dao_1 = __importDefault(require("../daos/ratingReview.dao"));
//import reviewCustomOutput from '../dtos/ratingReview.dto';
const user_dao_1 = __importDefault(require("../daos/user.dao"));
const catch_error_1 = __importDefault(require("../error/catch-error"));
class RatingReview {
    constructor() {
        this.getByUserId = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.ratingReviewDAO.getByUserId(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getByItemId = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const userName = '';
                const result = yield this.ratingReviewDAO.getByItemId(id);
                console.log(result);
                const l = [];
                if (result) {
                    //const user = await this.userDAO.getByIds(result[0].userId);
                    //result.push(userId::RatingReviewDTO:user.name.toString());
                    let total = 0;
                    for (let i = 0; i < result.length; i++) {
                        total += result[i].rating;
                    }
                    const ratingTotal = total / result.length;
                    for (let i = 0; i < result.length; i++) {
                        let userDetails;
                        if (result[i].userId !== "") {
                            userDetails = yield this.userDAO.getById(result[i].userId);
                        }
                        const resBody = {
                            itemId: result[i].itemId,
                            userId: result[i].userId,
                            review: result[i].review,
                            rating: result[i].rating.toString(),
                            deleted: result[i].deleted,
                            username: userDetails.name,
                            _id: result[i]._id,
                            added: result[i].added,
                        };
                        l.push(resBody);
                    }
                    res.json({ success: true, data: l, avgRating: ratingTotal });
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.ratingReviewDAO.getById(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getAllRatingsandReview = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.ratingReviewDAO.getAllRatingReviews();
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.deleteRatingReview = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.ratingReviewDAO.delete(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.addNewRatingReview = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const result = yield this.ratingReviewDAO.create(dto);
                res.json({ success: true, status: 'added successfully!' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateReviewRating = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const dto = req.body;
                const result = this.ratingReviewDAO.update(id, dto);
                res.json({ success: true, status: 'updated successful!' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.ratingReviewDAO = new ratingReview_dao_1.default();
        this.userDAO = new user_dao_1.default();
    }
}
exports.RatingReview = RatingReview;
//# sourceMappingURL=ratingReview.controller.js.map