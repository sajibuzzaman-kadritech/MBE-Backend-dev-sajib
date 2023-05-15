"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApplicationError extends Error {
    constructor(status, message, isHandledError) {
        super(message);
        this.status = status;
        this.message = message;
        this.isHandledError = isHandledError;
    }
}
exports.default = ApplicationError;
//# sourceMappingURL=application-error.js.map