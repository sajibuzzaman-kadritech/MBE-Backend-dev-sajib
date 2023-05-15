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
exports.ForgotPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const user_dao_1 = __importDefault(require("../daos/user.dao"));
const catch_error_1 = __importDefault(require("../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../error/handled-application-error"));
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
class ForgotPassword {
    constructor() {
        this.forgotPassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                //res.json(req.body.email);
                //await this.emailSendingTest();
                const user = yield this.checkEmailExists(req.body.email);
                const sendStatus = yield this.createForgotPasswordTokenAndSendMail(user, res);
                if (sendStatus) {
                    return res.json({
                        message: 'email sent successfully',
                        success: true,
                        hasSecurityQuestions: false,
                    });
                }
                else {
                    throw new handled_application_error_1.default(417, 'error while sending email, please contact support team');
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.changePassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const newPass = req.body.password;
            const token = req.body.token;
            const decoded = (0, jwt_decode_1.default)(token);
            const existingUser = yield this.userDAO.getByEmail(decoded.email);
            if (!existingUser) {
                throw new handled_application_error_1.default(409, 'account Doesnot exist');
            }
            const hashedPassword = yield this.generateHash('multibrandelectronicsmbes', newPass);
            const result = yield this.userDAO.updatePass(decoded.email, hashedPassword);
            res.json({ success: true, token, status: 'password updated successfully' });
        });
        this.userDAO = new user_dao_1.default();
    }
    generateHash(prefixSecretKey, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const passwordModified = yield this.hashComparision(prefixSecretKey, password);
            const saltRounds = 10;
            const salt = bcryptjs_1.default.genSaltSync(saltRounds);
            const hashedPassword = bcryptjs_1.default.hashSync(passwordModified, salt);
            return hashedPassword;
        });
    }
    hashComparision(prefixSecretKey, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const prefixKeyArray = prefixSecretKey.match(/.{1,4}/g);
            const passwordModified = prefixKeyArray[2] +
                password +
                prefixKeyArray[1] +
                password +
                prefixKeyArray[0] +
                password +
                prefixKeyArray[3] +
                password;
            return passwordModified;
        });
    }
    generateToken(id, email) {
        const token = jwt.sign({ id, email }, 'multibrandelectronicsmbes');
        return token;
    }
    createForgotPasswordTokenAndSendMail(user, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = this.generateToken(user._id, user.email);
            let name = '';
            if (user.name) {
                name = `${user.name}`;
            }
            const sendStatus = true;
            yield this.sendForgetPasswordMail(user.email, name, token);
            return sendStatus;
        });
    }
    sendForgetPasswordMail(email, firstName, jwtToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://storage.googleapis.com/mbewebsite';
            const resetPasswordLink = `${url}/resetpassword?token=${jwtToken}`;
            return yield this.sendResetPasswordMail(email, firstName, resetPasswordLink);
        });
    }
    sendResetPasswordMail(to, username, resetLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const variablesAndValues = [
                { key: 'username', value: username },
                { key: 'email', value: to },
                { key: 'resetLink', value: resetLink },
            ];
            return yield this.readTemplate2(to, 'reset password', variablesAndValues);
        });
    }
    readTemplate(to, subject, variableAndValues) {
        return __awaiter(this, void 0, void 0, function* () {
            const credentials = {
                accessKeyId: '',
                secretAccessKey: '',
            };
            AWS.config.update({
                credentials,
                region: '',
            });
            const params = {
                Destination: {
                    ToAddresses: [to],
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: 'UTF-8',
                            Data: `Passsword reset link ${variableAndValues[2].value}`,
                        },
                        Text: {
                            Charset: 'UTF-8',
                            Data: `Passsword reset link ${variableAndValues[2].value}`,
                        },
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: 'Password reset link',
                    },
                },
                Source: '',
            };
            const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
                .sendEmail(params)
                .promise();
            return sendPromise
                .then((data) => {
                return true;
            })
                .catch((err) => {
                const a = 10;
            });
        });
    }
    checkEmailExists(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userDAO.getByEmail(req);
            if (user === null) {
                throw new handled_application_error_1.default(400, 'invalid email address provided, please try again');
            }
            return user;
        });
    }
    readTemplate2(to, subject, variableAndValues) {
        return __awaiter(this, void 0, void 0, function* () {
            /* const credentials = {
               accessKeyId: '',
               secretAccessKey: '',
             };
             AWS.config.update({
               credentials,
               region: '',
             });
             */
            const params = {
                Destination: {
                    ToAddresses: [to],
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: 'UTF-8',
                            Data: `Passsword reset link ${variableAndValues[2].value}`,
                        },
                        Text: {
                            Charset: 'UTF-8',
                            Data: `Passsword reset link ${variableAndValues[2].value}`,
                        },
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: 'Password reset link',
                    },
                },
                Source: '',
            };
            //EMAIL SENDER BY SUBODH(26.Feb)
            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'subodhiat8@gmail.com',
                    pass: 'Bz21@3456'
                }
            });
            var mailOptions = {
                from: 'subodhiat8@gmail.com',
                to: to,
                subject: 'Password Reset Link | MBE',
                //text: `Passsword reset link ${variableAndValues[2].value}`,
                html: 'Hi ' + `${variableAndValues[0].value}` + '<br><br>To reset your password, <a href="' + `${variableAndValues[2].value}` + '"><b>Click here</b></a>.<br><br>Should you have any questions or issues, email us at support@mbe.com<br><br><br><b>-The MBE team.</b>'
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return false;
                    //res.json(error);
                    console.log(error);
                }
                else {
                    return true;
                    //res.json('Email sent: ' + info.response);
                    console.log('Email sent: ' + info.response);
                }
            });
            const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
                .sendEmail(params)
                .promise();
            return sendPromise
                .then((data) => {
                return true;
            })
                .catch((err) => {
                const a = 10;
            });
            /*
            const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
              .sendEmail(params)
              .promise();
        
            return sendPromise
              .then((data: any) => {
                return true;
              })
              .catch((err: any) => {
                const a = 10;
              });
              */
        });
    }
    emailSendingTest(email) {
        return __awaiter(this, void 0, void 0, function* () {
            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'subodhiat8@gmail.com',
                    pass: 'Bz21@3456'
                }
            });
            var mailOptions = {
                from: 'subodhiat8@gmail.com',
                to: 'subodh6580@gmail.com',
                subject: 'Sending Email using Node.js',
                text: 'That was test message!'
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    //res.json(error);
                    console.log(error);
                }
                else {
                    //res.json('Email sent: ' + info.response);
                    console.log('Email sent: ' + info.response);
                }
            });
        });
    }
}
exports.ForgotPassword = ForgotPassword;
//# sourceMappingURL=forgetPassword.controller.js.map