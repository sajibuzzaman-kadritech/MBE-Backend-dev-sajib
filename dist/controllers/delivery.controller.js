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
exports.Delivery = void 0;
const delivery_dao_1 = __importDefault(require("../daos/delivery.dao"));
const user_dao_1 = __importDefault(require("../daos/user.dao"));
const catch_error_1 = __importDefault(require("../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../error/handled-application-error"));
const moment_1 = __importDefault(require("moment"));
const { PubSub } = require('@google-cloud/pubsub');
class Delivery {
    constructor() {
        this.addDeliveryCity = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const currentTime = (0, moment_1.default)().toISOString();
                // @ts-ignore
                dto.added = currentTime;
                if (dto.delivery_type == '' && dto.city_name == '') {
                    throw new handled_application_error_1.default(401, 'delivery type is required');
                }
                const result = yield this.deliveryDAO.create(dto);
                res.json({ success: true, deliveryId: result._id.toString() });
                return;
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateDeliveryCity = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const currentTime = (0, moment_1.default)().toISOString();
                // @ts-ignore
                dto.updated = currentTime;
                const delivery_id = req.params.id;
                const deliveryDetails = yield this.deliveryDAO.getById(delivery_id.toString());
                if (!deliveryDetails) {
                    throw new handled_application_error_1.default(401, 'delivery city does not exist!');
                }
                const updateBody = {};
                if (dto.city_name) {
                    updateBody.city_name = dto.city_name;
                }
                if (dto.delivery_type) {
                    updateBody.delivery_type = dto.delivery_type;
                }
                if (dto.status) {
                    updateBody.status = dto.status;
                }
                updateBody.updated = new Date;
                const rest = yield this.deliveryDAO.updateC(deliveryDetails._id.toString(), updateBody);
                res.json({ success: true, deliveryId: deliveryDetails._id.toString() });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getAllDeliveryCities = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const delivery_id = req.query.delivery_id;
                if (delivery_id) {
                    const data = yield this.deliveryDAO.getById(delivery_id.toString());
                    if (data) {
                        res.json({ success: true, data });
                    }
                    else {
                        res.json({ success: false, status: 'No data found!' });
                    }
                }
                else {
                    const filter = {};
                    filter.$or = [{ status: 'Active' }, { status: 'Not Active' }];
                    const data = yield this.deliveryDAO.getByFilter1(filter);
                    //const data = await this.deliveryDAO.getByFilter({ $or: [{ status: 'Active' },{ status: 'Not Active' }] });
                    if (data) {
                        res.json({ success: true, data });
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
        this.deleteCity = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.deliveryDAO.delete(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.deliveryDAO = new delivery_dao_1.default();
        this.userDAO = new user_dao_1.default();
    }
}
exports.Delivery = Delivery;
//# sourceMappingURL=delivery.controller.js.map