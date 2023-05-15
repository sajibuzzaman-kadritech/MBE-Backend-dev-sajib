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
const notification_schema_1 = require("../models/notification.schema");
class NotificationDAO {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createDTO = new notification_schema_1.notificationModel(dto);
            return yield createDTO.save();
        });
    }
    getAllNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield notification_schema_1.notificationModel.find().exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield notification_schema_1.notificationModel.findById(id).exec();
        });
    }
    getByItemId(id, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield notification_schema_1.notificationModel.findOne({ itemId: id, email }).exec();
        });
    }
    getByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield notification_schema_1.notificationModel.find({ userId: id }).exec();
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateDTO = yield notification_schema_1.notificationModel.findById(id).exec();
            Object.assign(updateDTO, dto);
            return yield updateDTO.save();
        });
    }
}
exports.default = NotificationDAO;
//# sourceMappingURL=notification.dao.js.map