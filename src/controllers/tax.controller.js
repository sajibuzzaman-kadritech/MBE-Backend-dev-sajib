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
exports.Tax = void 0;
const tax_dao_1 = __importDefault(require("../daos/tax.dao"));
const user_dao_1 = __importDefault(require("../daos/user.dao"));
const catch_error_1 = __importDefault(require("../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../error/handled-application-error"));
const { PubSub } = require('@google-cloud/pubsub');
class Tax {
    constructor() {
        this.addTax = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                if (dto.tax_value == null && dto.tax_type == null && dto.tax_name == null) {
                    throw new handled_application_error_1.default(401, 'All filed is required');
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
                const result = yield this.taxDAO.create(dto);
                res.json({ success: true, taxId: result._id.toString() });
                return;
                //res.json({ success: true, chatId: data._id.toString() });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateTax = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const tax_id = req.params.id;
                const taxDetails = yield this.taxDAO.getById(tax_id.toString());
                if (!taxDetails) {
                    throw new handled_application_error_1.default(401, 'tax id does not exist!');
                }
                const updateBody = {};
                if (dto.tax_value) {
                    updateBody.tax_value = dto.tax_value;
                }
                if (dto.tax_type) {
                    updateBody.tax_type = dto.tax_type;
                }
                if (dto.tax_name) {
                    updateBody.tax_name = dto.tax_name;
                }
                if (dto.status) {
                    updateBody.status = dto.status;
                }
                updateBody.updated = new Date;
                const rest = yield this.taxDAO.updateC(taxDetails._id.toString(), updateBody);
                res.json({ success: true, taxId: taxDetails._id.toString() });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.deleteTax = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.taxDAO.delete(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getAllTaxes = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tax_id = req.query.tax_id;
                if (tax_id) {
                    const data = yield this.taxDAO.getById(tax_id.toString());
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
                    const data = yield this.taxDAO.getByFilter1(filter);
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
        this.taxDAO = new tax_dao_1.default();
        this.userDAO = new user_dao_1.default();
    }
}
exports.Tax = Tax;
//# sourceMappingURL=tax.controller.js.map