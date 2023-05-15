"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handled_application_error_1 = __importDefault(require("./handled-application-error"));
const unhandled_application_error_1 = __importDefault(require("./unhandled-application-error"));
function catchError(err, next) {
    const fullstack = err.stack + getCurrentStack();
    console.trace(err); // tslint:disable-line
    if (err instanceof handled_application_error_1.default) {
        next(err);
    }
    else {
        next(new unhandled_application_error_1.default(`${err}`));
    }
}
function getCurrentStack() {
    const err = new Error();
    return err.stack;
}
exports.default = catchError;
//# sourceMappingURL=catch-error.js.map