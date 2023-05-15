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
exports.Notification = void 0;
const notification_dao_1 = __importDefault(require("../daos/notification.dao"));
const catch_error_1 = __importDefault(require("../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../error/handled-application-error"));
class Notification {
    constructor() {
        this.scheduleNotification = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const check = yield this.notificationDAO.getByItemId(dto.itemId, dto.email);
                if (check) {
                    res.json({ msg: 'notification already scheduled' });
                    return;
                }
                const result = yield this.notificationDAO.create(dto);
                res.json({ msg: 'scheduled successfully' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getAllNotifications = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let userid = '';
                if (req.query.userid && req.query.userid !== '') {
                    userid = req.query.userid.toString();
                }
                if (userid === '') {
                    throw new handled_application_error_1.default(417, 'invalid userId');
                }
                const result = yield this.notificationDAO.getByUserId(userid);
                // let notify:any = [];
                // for (let i = 0; i < result.length; i++) {
                //  notify[i] = {id:result[i]._id,type:result[i].type,name:result[i].name,email:result[i].email,date:result[i].added.at};
                // }
                res.json({ success: true, data: result });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.notificationDAO = new notification_dao_1.default();
    }
}
exports.Notification = Notification;
//# sourceMappingURL=notification.controller.js.map