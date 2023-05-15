"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const application_error_1 = __importDefault(require("./application-error"));
class UnhandledApplicationError extends application_error_1.default {
    constructor(message) {
        super(500, message, false);
    }
}
exports.default = UnhandledApplicationError;
//# sourceMappingURL=unhandled-application-error.js.map