"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.User = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("config"));
const admin = __importStar(require("firebase-admin"));
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const address_dao_1 = __importDefault(require("../daos/address.dao"));
const user_dao_1 = __importDefault(require("../daos/user.dao"));
const catch_error_1 = __importDefault(require("../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../error/handled-application-error"));
const cart_dao_1 = __importDefault(require("../daos/cart.dao"));
const moment_1 = __importDefault(require("moment"));
const jwt = require('jsonwebtoken');
// @ts-ignore
class User {
    constructor() {
        this.addUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const existingUser = yield this.userDAO.getByEmail(req.body.email);
                if (existingUser) {
                    throw new handled_application_error_1.default(409, 'email id already registered');
                }
                const hashedPassword = yield this.generateHash('multibrandelectronicsmbes', req.body.password);
                dto.password = hashedPassword;
                const currentTime = (0, moment_1.default)().toISOString();
                dto.created = {
                    // @ts-ignore
                    at: currentTime
                };
                dto.updated = {
                    // @ts-ignore
                    at: currentTime
                };
                const result = yield this.userDAO.create(dto);
                const token = this.generateToken(result._id, result.email);
                const result2 = this.userDAO.updateRememberToken(result._id, token);
                //SEND ACTIVATION LINK
                //EMAIL SENDER BY SUBODH(27.Feb)
                var nodemailer = require('nodemailer');
                const url = 'https://storage.googleapis.com/mbewebsite/index.html#';
                const accountActivationLink = `https://multibrandselectronics.com/activate/${token}`;
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'Social@multibrandselectronics.com',
                        pass: 'navqbqczsyqfpcky',
                    },
                });
                var mailOptions = {
                    from: 'Social@multibrandselectronics.com',
                    to: result.email,
                    subject: 'Account Activation | MBE',
                    //text: `Passsword reset link ${variableAndValues[2].value}`,
                    html: 'Hi ' +
                        `${result.name}` +
                        '<br><br>To activate your account, <a href="' +
                        `${accountActivationLink}` +
                        '"><b>Click here</b></a>.<br><br>Should you have any questions or issues, email us at support@mbe.com<br><br><br><b>-The MBE team.</b>',
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        // res.json({ success: false, status: error });
                        console.log(error);
                    }
                    else {
                        //return true;
                        //res.json('Email sent: ' + info.response);
                        console.log('Email sent: ' + info.response);
                    }
                });
                console.log('log-token', token);
                res.json({
                    success: true,
                    token,
                    status: 'User successfully Signed up, please check your email to verify your account',
                });
                //END SEND LINK
                //res.json({ success: true, token, status: 'registered successfully check email for account activation' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.deleteUserAccount = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.userDAO.deleteAccount(id);
                res.json({ data: 'success' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.changeStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const status = req.body;
                const result = yield this.userDAO.statusChange(id, status);
                res.json({ data: 'success' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.deleteStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.userDAO.delete1(id);
                res.json({ data: 'success' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateProfilePhoto = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                //const image = JSON.stringify(req.body.image);
                const image = req.body.image;
                if (image === undefined) {
                    throw new handled_application_error_1.default(401, 'profile image is required');
                }
                const img = image;
                const result = yield this.userDAO.updatePhoto(id, img);
                res.json({ data: 'success' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                let userId = '';
                if (req.query.userId && req.query.userId !== '') {
                    userId = req.query.userId.toString();
                }
                if (userId === '') {
                    throw new handled_application_error_1.default(417, 'invalid userId');
                }
                const user = yield this.userDAO.getById(userId);
                //res.json(user);
                if (!user) {
                    //this.accountDoesNotExist();
                    res.json({ success: false, status: 'account does not exist!' });
                }
                else {
                    const currentTime = (0, moment_1.default)().toISOString();
                    dto.updated = {
                        // @ts-ignore
                        at: currentTime
                    };
                    const result = yield this.userDAO.update(user._id, dto);
                    if (result) {
                        res.json({ success: true, status: 'user updated successfully' });
                    }
                    else {
                        throw new handled_application_error_1.default(500, 'unable to update user details');
                    }
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getUserByEmail = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const email = req.header('email');
                const user = yield this.userDAO.getByEmail(email);
                if (!user) {
                    //this.accountDoesNotExist();
                    res.json({ success: false, status: 'account does not exist!' });
                }
                else {
                    const paddress = yield this.addressDAO.getPrimaryAddressForUser(user._id);
                    res.json({
                        success: true,
                        userDetails: user,
                        primaryAddress: paddress,
                    });
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getUserById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.header('Authorization');
                console.log('token###getUserById = ' + token);
                if (token && token.split(' ').length > 1) {
                    const decoded = (0, jwt_decode_1.default)(token.split(' ')[1]);
                    console.log('decoded###getUserById = ', decoded.id);
                    const user = yield this.userDAO.getByEmail(decoded.email);
                    console.log('######user###', user);
                    if (!user) {
                        //this.accountDoesNotExist();
                        res.json({ success: false, status: 'account does not exist!' });
                    }
                    else {
                        const paddress = yield this.addressDAO.getPrimaryAddressForUser(user._id);
                        res.json({
                            success: true,
                            userDetails: user,
                            primaryAddress: paddress,
                        });
                    }
                }
                else {
                    throw new handled_application_error_1.default(417, 'invalid token');
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getUserByUserId = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let userId = '';
                if (req.query.userId && req.query.userId !== '') {
                    userId = req.query.userId.toString();
                }
                if (userId === '') {
                    throw new handled_application_error_1.default(417, 'invalid userId');
                }
                const user = yield this.userDAO.getById(userId);
                if (!user) {
                    //this.accountDoesNotExist();
                    res.json({ success: false, status: 'account does not exist!' });
                }
                else {
                    const paddress = yield this.addressDAO.getPrimaryAddressForUser(user._id);
                    res.json({
                        success: true,
                        userDetails: user,
                        primaryAddress: paddress,
                    });
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getUserSettingByUserId = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let userId = '';
                if (req.query.userId && req.query.userId !== '') {
                    userId = req.query.userId.toString();
                }
                if (userId === '') {
                    throw new handled_application_error_1.default(417, 'invalid userId');
                }
                const user = yield this.userDAO.getById(userId);
                if (!user) {
                    //this.accountDoesNotExist();
                    res.json({ success: false, status: 'account does not exist!' });
                }
                else {
                    const paddress = yield this.addressDAO.getPrimaryAddressForUser(user._id);
                    res.json({ success: true, userDetails: user });
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.login = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const email = dto.email;
                if (!email) {
                    throw new Error('invalid Email Address');
                }
                const user = yield this.userDAO.getByEmail(email);
                if (!user) {
                    res.json({ success: false, status: 'account does not exist!' });
                    return;
                }
                if (user.status != 'Active') {
                    res.json({
                        success: false,
                        status: 'Sorry your account is not active!',
                    });
                    return;
                }
                if (dto.fcmToken) {
                    user.fcmToken = dto.fcmToken;
                    const updateUser = yield this.userDAO.update(user._id, user);
                }
                const passSecret = yield this.hashComparision('multibrandelectronicsmbes', req.body.password);
                const result = bcryptjs_1.default.compareSync(passSecret, user.password);
                if (result) {
                    const token = this.generateToken(user._id, user.email);
                    res.json({ success: true, token, status: 'success', role: user.role });
                }
                else {
                    this.invalidCredentials();
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.googleSignUp = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idToken = req.params.idToken;
                let tokenBody;
                admin
                    .auth()
                    .verifyIdToken(idToken)
                    .then((decodedToken) => __awaiter(this, void 0, void 0, function* () {
                    tokenBody = decodedToken;
                    const body = {
                        type: 'GoogleSignIn',
                        uid: tokenBody.uid,
                        name: tokenBody.name,
                        emailVerified: true,
                        email: tokenBody.email,
                        deleted: true,
                        termsAndConditions: true,
                    };
                    const dto = body;
                    const result = yield this.userDAO.createGoogle(dto);
                    const token = this.generateToken(result._id, result.email);
                    res.json({ success: true, token, status: 'registered successfully' });
                }))
                    .catch((error) => {
                    (0, catch_error_1.default)(error, next);
                });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.googleLogin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idToken = req.params.idToken;
                const typeoff = req.body.loginType;
                let tokenBody;
                tokenBody = req.body.tokenBody;
                const user = yield this.userDAO.getByEmail(tokenBody.email);
                if (!user) {
                    const currentTime = (0, moment_1.default)().toISOString();
                    const body = {
                        type: typeoff,
                        uid: tokenBody.uid,
                        name: tokenBody.name,
                        emailVerified: true,
                        email: tokenBody.email,
                        deleted: false,
                        termsAndConditions: true,
                        profilePhoto: tokenBody.profilePhoto,
                        status: 'Active',
                        fcmToken: req.body.fcmToken,
                        created: { at: currentTime }
                    };
                    const dto = body;
                    const result = yield this.userDAO.createGoogle(dto);
                    // console.log("###result", result);
                    const token = this.generateToken(result._id, result.email);
                    res.json({ success: true, token, status: 'registered successfully' });
                    return;
                }
                else {
                    const reactivatedUser = yield this.userDAO.reactivateDeletedAccount(user._id);
                    const token = this.generateToken(reactivatedUser._id, user.email);
                    res.json({ success: true, token, status: 'success' });
                    return;
                }
                if (user.status != 'Active') {
                    res.json({
                        success: false,
                        status: 'Sorry your account is not active!',
                    });
                    return;
                }
                const token = this.generateToken(user._id, user.email);
                //@ts-ignore
                if (req.body.fcmToken) {
                    //@ts-ignore
                    user.fcmToken = req.body.fcmToken;
                    const updateUser = yield this.userDAO.update(user._id, user);
                }
                res.json({ success: true, token, status: 'success' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getAllUsers = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userDAO.getAllUsers();
                const l = [];
                const filter2 = {};
                for (const con of user) {
                    filter2.userId = con._id;
                    const result = yield this.cartDAO.getOrderedCartsByUserId(filter2);
                    con.orders = result.length;
                    const paddress = yield this.addressDAO.getPrimaryAddressForUser(con._id);
                    const resBody = { userDetails: con, address: paddress };
                    l.push(resBody);
                }
                res.json(l);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getSiteUsers = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userDAO.getSiteUsers();
                const l = [];
                for (const con of user) {
                    const paddress = yield this.addressDAO.getPrimaryAddressForUser(con._id);
                    const resBody = { userDetails: con, address: paddress };
                    l.push(resBody);
                }
                res.json(l);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.readPreSignedUrl = (fileName) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Storage } = require('@google-cloud/storage');
                // Creates a client
                const storage = new Storage({
                    projectId: config_1.default.get('gcp.projectId'),
                    keyFilename: 'for-poc-325210-a7e014fe2cab.json',
                });
                const options = {
                    version: 'v4',
                    action: 'read',
                    expires: Date.now() + 450 * 10 * 1000, // 15 minutes
                };
                const [url] = yield storage
                    .bucket(config_1.default.get('gcp.bucket'))
                    .file(fileName)
                    .getSignedUrl(options);
                return url;
            }
            catch (err) {
                return '';
            }
        });
        this.signupTokenVerify = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                //const email =  req.body.email;
                const email_token = req.body.token;
                const user = yield this.userDAO.getByToken(email_token);
                if (!user) {
                    res.json({ success: false, status: 'Sorry invalid token!' });
                }
                if (user.remember_token == email_token) {
                    const user2 = yield this.userDAO.statusChangeActive(user._id);
                    if (user2) {
                        res.json({
                            success: true,
                            status: 'Email token verified and your account is activated now.',
                        });
                    }
                    else {
                        res.json({
                            success: true,
                            status: 'Token verify but status is not updated on DB!',
                        });
                    }
                }
                else {
                    res.json({ success: false, status: 'Sorry your token miss matched!' });
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.forgetTokenVerifySetNpwd = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const email_token = req.body.token;
                const user = yield this.userDAO.getByToken(email_token);
                if (!user) {
                    res.json({ success: false, status: 'Sorry invalid token!' });
                }
                if (!req.body.new_password) {
                    res.json({ success: false, status: 'New password is required!' });
                }
                const hashedPassword = yield this.generateHash('multibrandelectronicsmbes', req.body.new_password);
                if (user.remember_token == email_token) {
                    const user2 = yield this.userDAO.updatePass(user.email, hashedPassword);
                    if (user2) {
                        res.json({
                            success: true,
                            status: 'Email token verified and your password is successfully updated.',
                        });
                    }
                    else {
                        res.json({
                            success: true,
                            status: 'Token verify but status is not updated on DB!',
                        });
                    }
                }
                else {
                    res.json({ success: false, status: 'Sorry your token miss matched!' });
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.addAdminUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const existingUser = yield this.userDAO.getByEmail(req.body.email);
                if (existingUser) {
                    throw new handled_application_error_1.default(409, 'email id already registered');
                }
                const hashedPassword = yield this.generateHash('multibrandelectronicsmbes', req.body.password);
                dto.password = hashedPassword;
                const currentTime = (0, moment_1.default)().toISOString();
                dto.created = {
                    // @ts-ignore
                    at: currentTime
                };
                const result = yield this.userDAO.create(dto);
                const token = this.generateToken(result._id, result.email);
                const result2 = this.userDAO.updateRememberToken(result._id, token);
                res.json({
                    success: true,
                    token,
                    status: 'Admin user registered successfully',
                });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.userDAO = new user_dao_1.default();
        this.addressDAO = new address_dao_1.default();
        this.cartDAO = new cart_dao_1.default();
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
    accountDoesNotExist() {
        throw new handled_application_error_1.default(401, 'account does not exist!');
    }
    invalidCredentials() {
        throw new handled_application_error_1.default(401, 'invalid credentials!');
    }
    generateToken(id, email) {
        const token = jwt.sign({ id, email }, 'multibrandelectronicsmbes');
        return token;
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
}
exports.User = User;
//# sourceMappingURL=user.controller.js.map