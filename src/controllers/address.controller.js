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
exports.Address = void 0;
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const address_dao_1 = __importDefault(require("../daos/address.dao"));
const user_dao_1 = __importDefault(require("../daos/user.dao"));
const catch_error_1 = __importDefault(require("../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../error/handled-application-error"));
const moment_1 = __importDefault(require("moment"));
class Address {
    constructor() {
        this.getPrimaryUserAddresses = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.header('Authorization');
                if (token && token.split(' ').length > 1) {
                    const decoded = (0, jwt_decode_1.default)(token.split(' ')[1]);
                    const user = yield this.userDAO.getByEmail(decoded.email);
                    if (!user) {
                        throw new handled_application_error_1.default(401, 'user account does not exist!');
                    }
                    else {
                        const result = yield this.addressDAO.getPrimaryAddressForUser(decoded.id);
                        if (result) {
                            res.json({ success: true, data: result });
                        }
                        else {
                            throw new handled_application_error_1.default(500, 'unable to get address for user');
                        }
                    }
                }
                else {
                    throw new handled_application_error_1.default(417, 'invalid token');
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getUserAddresses = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let userId = '';
                if (req.query.userId && req.query.userId !== '') {
                    userId = req.query.userId.toString();
                }
                const user = yield this.userDAO.getById(userId);
                if (!user) {
                    throw new handled_application_error_1.default(401, 'user account does not exist!');
                }
                else {
                    const result = yield this.addressDAO.getByUserId(userId);
                    if (result) {
                        res.json({ success: true, data: result });
                    }
                    else {
                        throw new handled_application_error_1.default(500, 'unable to get address for user');
                    }
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateAddress = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const addressData = req.body;
                const currentTime = (0, moment_1.default)().toISOString();
                addressData.added = {
                    // @ts-ignore
                    at: currentTime
                };
                const result = yield this.addressDAO.update(id, addressData);
                if (result) {
                    res.json({ success: true, status: 'success' });
                }
                else {
                    throw new handled_application_error_1.default(500, 'unable to update address');
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getAddressById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.addressDAO.getById(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.addNewAddress = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const currentTime = (0, moment_1.default)().toISOString();
                dto.added = {
                    // @ts-ignore
                    at: currentTime
                };
                const user = yield this.userDAO.getById(dto.userId);
                if (!user) {
                    throw new handled_application_error_1.default(401, 'account does not exist!');
                }
                else {
                    const paddress = yield this.addressDAO.getPrimaryAddressForUser(dto.userId);
                    if (paddress) {
                        const result = yield this.addressDAO.create(dto);
                        if (result) {
                            res.json({ success: true, status: 'address added successfully' });
                        }
                        else {
                            throw new handled_application_error_1.default(500, 'unable to add address');
                        }
                    }
                    else {
                        const pdto = dto;
                        pdto.primary = true;
                        const result = yield this.addressDAO.create(pdto);
                        if (result) {
                            res.json({ success: true, status: 'address added successfully' });
                        }
                        else {
                            throw new handled_application_error_1.default(500, 'unable to add address');
                        }
                    }
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.deleteAddress = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.addressDAO.delete(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.addressDAO = new address_dao_1.default();
        this.userDAO = new user_dao_1.default();
    }
}
exports.Address = Address;
//# sourceMappingURL=address.controller.js.map