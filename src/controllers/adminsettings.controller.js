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
exports.Adminsettings = void 0;
const adminsettings_dao_1 = __importDefault(require("../daos/adminsettings.dao"));
const user_dao_1 = __importDefault(require("../daos/user.dao"));
const tmc_dao_1 = __importDefault(require("../daos/tmc.dao"));
const catch_error_1 = __importDefault(require("../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../error/handled-application-error"));
const { PubSub } = require('@google-cloud/pubsub');
class Adminsettings {
    constructor() {
        this.addESTDelivery = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                if (dto.est_delivery > 0) {
                    throw new handled_application_error_1.default(401, 'est_delivery in days is required');
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
                const result = yield this.adminsettingsDAO.create(dto);
                res.json({ success: true, Id: result._id.toString() });
                return;
                //res.json({ success: true, chatId: data._id.toString() });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateAdminSettings = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const settings_id = req.params.id;
                const adminsettingsDetails = yield this.adminsettingsDAO.getById(settings_id.toString());
                if (!adminsettingsDetails) {
                    throw new handled_application_error_1.default(401, 'admin settings id does not exist!');
                }
                let settingStatus;
                if (dto.status == null) {
                    settingStatus = 'Active';
                }
                else {
                    settingStatus = dto.status;
                }
                let updateBody = {};
                if (dto.est_delivery) {
                    if (dto.est_delivery > 0) {
                        updateBody = { est_delivery: dto.est_delivery, status: settingStatus, updated: new Date };
                    }
                    else {
                        updateBody = { est_delivery: adminsettingsDetails.est_delivery, updated: new Date };
                    }
                }
                const rest = yield this.adminsettingsDAO.updateC(adminsettingsDetails._id.toString(), updateBody);
                res.json({ success: true, Id: adminsettingsDetails._id.toString() });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getAllAdminSettings = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.query.id;
                if (id) {
                    const data = yield this.adminsettingsDAO.getById(id.toString());
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
                    const data = yield this.adminsettingsDAO.getByFilter1(filter);
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
        this.getAllTMC = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.query.id;
                if (id) {
                    const data = yield this.tmcDAO.getById(id.toString());
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
                    const data = yield this.tmcDAO.getByFilter1(filter);
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
        this.addTMC = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                if (!dto.message) {
                    throw new handled_application_error_1.default(401, 'message is required');
                }
                const result = yield this.tmcDAO.create(dto);
                res.json({ success: true, Id: result._id.toString() });
                return;
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateTMC = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const tmc_id = req.params.id;
                const tmcDetails = yield this.tmcDAO.getById(tmc_id.toString());
                if (!tmcDetails) {
                    throw new handled_application_error_1.default(401, 'tmc does not exist!');
                }
                let tmcStatus;
                if (dto.status == null) {
                    tmcStatus = 'Active';
                }
                else {
                    tmcStatus = dto.status;
                }
                let updateBody = {};
                if (dto.message) {
                    if (dto.message) {
                        updateBody = { message: dto.message, status: tmcStatus, updated: new Date };
                    }
                    else {
                        updateBody = { message: tmcDetails.message, updated: new Date };
                    }
                }
                const rest = yield this.tmcDAO.updateC(tmcDetails._id.toString(), updateBody);
                res.json({ success: true, Id: tmcDetails._id.toString() });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.adminsettingsDAO = new adminsettings_dao_1.default();
        this.userDAO = new user_dao_1.default();
        this.tmcDAO = new tmc_dao_1.default();
    }
}
exports.Adminsettings = Adminsettings;
//# sourceMappingURL=adminsettings.controller.js.map