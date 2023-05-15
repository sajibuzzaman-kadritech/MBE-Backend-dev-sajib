"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const application_error_1 = __importDefault(require("./application-error"));
class HandledApplicationError extends application_error_1.default {
    constructor(status, message) {
        super(status, message, true);
    }
}
exports.default = HandledApplicationError;
//# sourceMappingURL=handled-application-error.js.map