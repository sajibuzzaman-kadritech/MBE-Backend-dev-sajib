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
exports.Review = void 0;
const review_dao_1 = __importDefault(require("../daos/review.dao"));
const user_dao_1 = __importDefault(require("../daos/user.dao"));
const catch_error_1 = __importDefault(require("../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../error/handled-application-error"));
class Review {
    constructor() {
        this.addReview = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                if (dto.senderId == '') {
                    throw new handled_application_error_1.default(401, 'user id is required');
                }
                if (dto.productId == '') {
                    throw new handled_application_error_1.default(401, 'product id is required');
                }
                const result = yield this.reviewDAO.create(dto);
                res.json({ success: true, reviewId: result._id.toString() });
                return;
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getAllReview = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const review_id = req.params.id;
                if (review_id) {
                    const data = yield this.reviewDAO.getById(review_id.toString());
                    if (data) {
                        const user = yield this.userDAO.getById(data.senderId);
                        res.json({ success: true, data: data, userName1: user.name });
                    }
                    else {
                        res.json({ success: false, status: 'No data found!' });
                    }
                }
                else {
                    const filter = {};
                    filter.$or = [{ status: 'Active' }, { status: 'Not Active' }];
                    const data = yield this.reviewDAO.getByFilter1(filter);
                    if (data) {
                        const user = yield this.userDAO.getById(data[0].senderId);
                        res.json({ success: true, data: data, userName: user.name });
                    }
                    else {
                        res.json({ success: false, status: 'No data found!' });
                    }
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getReviewByProductId = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let productId = '';
                if (req.params.id && req.params.id !== '') {
                    productId = req.params.id.toString();
                }
                if (productId === '') {
                    throw new handled_application_error_1.default(417, 'invalid productId');
                }
                const resultBody = [];
                const data = yield this.reviewDAO.getByProductId(productId);
                if (!data) {
                    res.json({ success: false, status: 'No data found!' });
                }
                else {
                    for (const d of data) {
                        const user = yield this.userDAO.getById(d.senderId);
                        //resultBody.username=user.name;
                        //const body: reviewCustomOutput = d;
                        const body = {
                            senderId: d.senderId,
                            productId: d.productId,
                            message: d.message,
                            rating: d.rating,
                            username: user.name,
                            _id: d._id,
                            added: d.added
                        };
                        resultBody.push(body);
                    }
                    res.json({ success: true, data: resultBody });
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getRatingByProductId = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let productId = '';
                if (req.params.id && req.params.id !== '') {
                    productId = req.params.id.toString();
                }
                if (productId === '') {
                    throw new handled_application_error_1.default(417, 'invalid productId');
                }
                const data = yield this.reviewDAO.getByProductId(productId);
                if (!data) {
                    res.json({ success: false, status: 'No data found!' });
                }
                else {
                    let total = 0;
                    for (let i = 0; i < data.length; i++) {
                        total += parseInt(data[i].rating);
                    }
                    const ratingTotal = total / data.length;
                    res.json({ success: true, data: data, avgRating: ratingTotal });
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.reviewDAO = new review_dao_1.default();
        this.userDAO = new user_dao_1.default();
    }
}
exports.Review = Review;
//# sourceMappingURL=review.controller.js.map