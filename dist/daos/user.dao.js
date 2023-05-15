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
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_schema_1 = require("../models/user.schema");
class UserDAO {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createDTO = new user_schema_1.userModel(dto);
            return yield createDTO.save();
        });
    }
    createGoogle(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createDTO = new user_schema_1.userModel(dto);
            return yield createDTO.save();
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_schema_1.userModel
                .find({
                email: { $ne: 'admin@mbe.com' },
                role: { $ne: 3 },
                deleted: false,
            })
                .exec();
        });
    }
    getDashbordUsers(fromdate, todate) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('getDashbordUsers', (0, moment_1.default)(fromdate, 'YYYY-M-DD').format(), (0, moment_1.default)(todate, 'YYYY-M-DD').format());
            return yield user_schema_1.userModel
                .find({
                'created.at': {
                    $gte: (0, moment_1.default)(fromdate, 'YYYY-M-DD').format(),
                    $lt: (0, moment_1.default)(todate, 'YYYY-M-DD').add(1, 'days').format(),
                },
                email: { $ne: 'admin@mbe.com' },
                role: { $ne: 3 },
            })
                .exec();
        });
    }
    getSiteUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_schema_1.userModel.find({ role: 3 }).exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_schema_1.userModel.findById(id).exec();
        });
    }
    getByIds(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_schema_1.userModel.find(filter).exec();
        });
    }
    getByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_schema_1.userModel
                .findOne({ $and: [{ email }, { deleted: false }] })
                .exec();
        });
    }
    getByEmail2(email, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_schema_1.userModel.findOne({ email, status }).exec();
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateDTO = yield user_schema_1.userModel.findById(id).exec();
            Object.assign(updateDTO, dto);
            return yield updateDTO.save();
        });
    }
    updatePass(email, npass) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_schema_1.userModel.findOneAndUpdate({ email }, { password: npass });
        });
    }
    updateBenId(id, bid) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_schema_1.userModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { beneficiaryId: bid });
        });
    }
    updateEmailVerif(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_schema_1.userModel.findOneAndUpdate({ email }, { emailVerified: true });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_schema_1.userModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { delete: true });
        });
    }
    delete1(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_schema_1.userModel.remove({ _id: mongoose_1.default.Types.ObjectId(id) }).exec();
        });
    }
    statusChange(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (params.status === 'Active') {
                return user_schema_1.userModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { status: 'Not Active' });
            }
            return user_schema_1.userModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { status: 'Active' });
        });
    }
    updateRememberToken(id, remember_token) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_schema_1.userModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { remember_token: remember_token });
        });
    }
    statusChangeActive(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_schema_1.userModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { status: 'Active', emailVerified: true });
        });
    }
    updatePhoto(id, image) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_schema_1.userModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { profilePhoto: image });
        });
    }
    getByToken(remember_token) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_schema_1.userModel.findOne({ remember_token }).exec();
        });
    }
    deleteAccount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_schema_1.userModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { deleted: true });
        });
    }
    reactivateDeletedAccount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_schema_1.userModel.findOneAndUpdate({ _id: mongoose_1.default.Types.ObjectId(id) }, { deleted: false });
        });
    }
}
exports.default = UserDAO;
//# sourceMappingURL=user.dao.js.map