"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationLevelError = void 0;
const standardErrorCodes = {
    code_000: 'Something went wrong. Please try again.',
    code_201: 'Created; Request has been fulfilled. New resource created',
    code_204: 'No Content; Request processed. No content returned',
    code_301: 'Moved Permanently; This and all future requests directed to the given URI',
    code_304: 'Not Modified; Resource has not been modified since last requested',
    code_400: 'Bad Request; Request cannot be fulfilled due to bad syntax',
    code_401: 'Unauthorized; Authentication is possible, but has failed',
    code_403: 'Forbidden; Server refuses to respond to request',
    code_404: 'Not Found; Requested resource could not be found',
    code_500: 'Internal Server Error; Generic error message when server fails',
    code_501: 'Not Implemented; Server does not recognize method or lacks ability to fulfill',
    code_503: 'Service Unavailable; Server is currently unavailable',
};
class ApplicationLevelError extends Error {
    constructor(name, message, status) {
        super();
        // Error.captureStackTrace(this, this.constructor);
        if (status && !message) {
            message = standardErrorCodes[`code_ ${status}`];
        }
        else if (!status && !message) {
            message = standardErrorCodes.code_000;
        }
        name = name || this.constructor.name;
        status = status || 500;
    }
}
exports.ApplicationLevelError = ApplicationLevelError;
//# sourceMappingURL=application-level-error.js.map