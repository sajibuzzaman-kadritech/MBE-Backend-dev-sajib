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
exports.Shippingtax = void 0;
const shippingtax_dao_1 = __importDefault(require("../daos/shippingtax.dao"));
const user_dao_1 = __importDefault(require("../daos/user.dao"));
const catch_error_1 = __importDefault(require("../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../error/handled-application-error"));
const { PubSub } = require('@google-cloud/pubsub');
class Shippingtax {
    constructor() {
        this.addShippingTax = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                if (dto.shipping_value == '' && dto.shipping_type == '') {
                    throw new handled_application_error_1.default(401, 'type and value is required');
                }
                //res.json(req.body);
                //const data = await this.messageDAO.getByFilter({ $or: [{ senderId: dto.senderId, status: 'New' }, { receiverId: dto.senderId, status: 'New' }] });
                /*
                  const senderDetails = await this.userDAO.getById(dto.senderId);
                  dto.senderName = senderDetails.name;
                  dto.senderImage = senderDetails.profilePhoto;
                  dto.senderEmail = senderDetails.email;
                  
                  if (dto.receiverId && dto.receiverId != '') {
                    //const recieiverDetails = await this.userDAO.getById(dto.receiverId);
                    dto.receiverName = 'Admin';//recieiverDetails.name;
                    dto.receiverImage = 'dsfcsf';//recieiverDetails.profilePhoto;
                  }
                  */
                //this.SendNotificationWS('chat', 'New', 'broadcast', dto.senderId);
                //this.SendNotificationWS('chat', 'New', 'broadcast', dto.receiverId);
                const result = yield this.shippingtaxDAO.create(dto);
                res.json({ success: true, shippingId: result._id.toString() });
                return;
                //res.json({ success: true, chatId: data._id.toString() });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateShippingtax = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const tax_id = req.params.id;
                const shippingtaxDetails = yield this.shippingtaxDAO.getById(tax_id.toString());
                if (!shippingtaxDetails) {
                    throw new handled_application_error_1.default(401, 'shipping tax id does not exist!');
                }
                const updateBody = {};
                if (dto.shipping_value) {
                    updateBody.shipping_value = dto.shipping_value;
                }
                if (dto.shipping_type) {
                    updateBody.shipping_type = dto.shipping_type;
                }
                if (dto.shipping_product) {
                    updateBody.shipping_product = dto.shipping_product;
                }
                if (dto.shipping_amount_type) {
                    updateBody.shipping_amount_type = dto.shipping_amount_type;
                }
                if (dto.status) {
                    updateBody.status = dto.status;
                }
                updateBody.updated = new Date;
                const rest = yield this.shippingtaxDAO.updateC(shippingtaxDetails._id.toString(), updateBody);
                res.json({ success: true, shippingId: shippingtaxDetails._id.toString() });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.deleteShipping = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.shippingtaxDAO.delete(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getAllShippingtaxes = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tax_id = req.query.tax_id;
                if (tax_id) {
                    const data = yield this.shippingtaxDAO.getById(tax_id.toString());
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
                    const data = yield this.shippingtaxDAO.getByFilter1(filter);
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
        this.shippingtaxDAO = new shippingtax_dao_1.default();
        this.userDAO = new user_dao_1.default();
    }
}
exports.Shippingtax = Shippingtax;
//# sourceMappingURL=shippingtax.controller.js.map