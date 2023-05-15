"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorHandler(error, request, response, next) {
    const status = error.status || 500;
    let message;
    if (!error.isHandledError) {
        message = 'Something went wrong';
    }
    else {
        message = error.message;
    }
    response.status(status).send({ message, status });
}
exports.default = errorHandler;
//# sourceMappingURL=error-handler.js.map