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
exports.Message = void 0;
const config_1 = __importDefault(require("config"));
const message_dao_1 = __importDefault(require("../daos/message.dao"));
const user_dao_1 = __importDefault(require("../daos/user.dao"));
const catch_error_1 = __importDefault(require("../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../error/handled-application-error"));
const { PubSub } = require('@google-cloud/pubsub');
const uuid_1 = require("uuid");
const AWS = require('aws-sdk');
class Message {
    constructor() {
        this.startChat = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const status = req.query.status;
                if (dto.senderId == '' && dto.receiverId == '') {
                    throw new handled_application_error_1.default(401, 'sender Id is required');
                }
                const data = yield this.messageDAO.getByFilter({ $and: [
                        { senderId: dto.senderId },
                        { status: { $not: { $eq: "Completed" } } }
                    ] });
                if (!data) {
                    if (dto.senderId == '2') {
                        dto.senderName = 'Admin';
                        dto.senderImage = 'https://storage.googleapis.com/mbebucket/dummy.png';
                        dto.senderEmail = 'admin@mbe.com';
                    }
                    else {
                        const senderDetails = yield this.userDAO.getById(dto.senderId);
                        console.log('####senderDetails', senderDetails);
                        dto.senderName = senderDetails.name;
                        dto.senderImage = senderDetails.profilePhoto ? senderDetails.profilePhoto : 'https://storage.googleapis.com/mbestbucket/dum_2022-08-23T203316.209Z_my.png';
                        ;
                        dto.senderEmail = senderDetails.email;
                        // if (senderDetails.profilePhoto !== '' || senderDetails.profilePhoto.indexOf("googleusercontent") == -1) {
                        //   const filenameL = senderDetails.profilePhoto.split('?')[0];
                        //   const filename = filenameL.split('/')[filenameL.split('/').length - 1];
                        //   const url = await this.readPreSignedUrl(filename);
                        //   dto.senderImage = url;
                        // }
                    }
                    if (dto.receiverId && dto.receiverId != '') {
                        //const recieiverDetails = await this.userDAO.getById(dto.receiverId);
                        dto.receiverName = 'Admin'; //recieiverDetails.name;
                        dto.receiverImage = 'dsfcsf'; //recieiverDetails.profilePhoto;
                    }
                    //'https://storage.googleapis.com/mbebucket/dummy.png'
                    // const uuidv4 = require('uuid/v4');
                    const pdto = dto;
                    pdto.chat = [{ user: { _id: dto.senderId, name: dto.senderName, avatar: dto.senderImage }, 'text': dto.chat[0].text, _id: (0, uuid_1.v4)(), createdAt: new Date }];
                    this.SendNotificationWS('chat', 'New', 'broadcast', dto.senderId);
                    console.log("dto.senderId", dto.senderId);
                    //this.SendNotificationWS('chat', 'New', 'broadcast', dto.receiverId);
                    const result = yield this.messageDAO.create(pdto);
                    (() => {
                        var nodemailer = require('nodemailer');
                        // send  mail to admin
                        var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            port: 465,
                            secure: true,
                            auth: {
                                user: 'Social@multibrandselectronics.com',
                                pass: 'navqbqczsyqfpcky'
                            }
                        });
                        let emalhtml = `<!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width">
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                        <title>Welcome Email Template</title>
                    </head>
                    <body>
                        <p style="font-size: 14px; font-weight: normal;">Hi admin,</p>
                        <p style="font-size: 14px; font-weight: normal;">There is a new chat message by ${dto.senderName} (${dto.senderEmail}). Please go to admin panel.</p>
                        
                        <p><br><br><br><b>- This is an automated mail, do not reply.</p>
                    </body>
                    </html>`;
                        var mailOptions = {
                            // from: 'subodhiat8@gmail.com',
                            from: 'Social@multibrandselectronics.com',
                            to: 'Hussein@multibrandselectronics.com',
                            subject: 'New Chat Message | MBE',
                            //text: `Passsword reset link ${variableAndValues[2].value}`,
                            html: emalhtml
                        };
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            }
                            else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                    })();
                    res.json({ success: true, chatId: result._id.toString() });
                    return;
                }
                console.log('has data');
                const chatDetails = data;
                let updateBody = {};
                // const uuidv4 = require('uuid/v4');
                this.SendNotificationWS('chat', 'New', chatDetails._id, dto.senderId);
                chatDetails.chat.push({ user: { _id: dto.senderId, name: chatDetails.senderName, avatar: chatDetails.senderImage }, 'text': dto.chat[0].text, _id: (0, uuid_1.v4)(), createdAt: new Date });
                //chatDetails.chat.push({ msg: dto.usermsg, id: dto.senderId });
                updateBody = { chat: chatDetails.chat, updated: new Date };
                const rest = yield this.messageDAO.updateC(chatDetails._id.toString(), updateBody);
                res.json({ success: true, chatId: chatDetails._id.toString() });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateChat = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // console.log('update###########asdasdsadsadsasadsadsadasdsa', req.params.id);
            try {
                const dto = req.body;
                const chatId = req.params.id;
                // console.log('asdsadsadsadsadsadsadsadsadasdassadsadsadsadsadsdsad');
                if (dto.senderId == '' && dto.receiverId == '') {
                    throw new handled_application_error_1.default(401, 'sender Id and receiver Id is required');
                }
                const chatDetails = yield this.messageDAO.getById(chatId.toString());
                if (!chatDetails) {
                    throw new handled_application_error_1.default(401, 'chat id doesnot exist');
                }
                let updateBody = {};
                // const uuidv4 = require('uuid/v4');
                if (dto.receiverId && dto.receiverId !== '') {
                    // const recieiverDetails = await this.userDAO.getById(dto.receiverId);
                    updateBody = { status: 'Started', receiverjointime: new Date, updated: new Date, receiverId: dto.receiverId, receiverName: 'Admin', receiverImage: '' };
                    this.SendNotificationWS('chat', 'Taken', 'broadcast', chatDetails.senderId);
                    console.log("chatDetails.senderId", chatDetails.senderId);
                }
                if (dto.status && dto.status != '') {
                    updateBody = { status: dto.status };
                }
                if (dto.usermsg && dto.usermsg != '') {
                    if (chatDetails.chat) {
                        //const pdto: MessageDTO = dto;
                        //pdto.chat = [{user:{_id:dto.senderId,name:chatDetails.senderName,avatar:dto.senderImage},'text':dto.chat[0].text,_id:uuidv4(),createdAt:new Date}];
                        this.SendNotificationWS('chat', 'New', 'broadcast', dto.senderId);
                        //avatar customer representative chat display
                        chatDetails.chat.push({ user: { _id: dto.senderId, name: chatDetails.senderName, avatar: 'https://storage.googleapis.com/mbestbucket/dum_2022-08-23T203316.209Z_my.png' }, 'text': dto.usermsg, _id: (0, uuid_1.v4)(), createdAt: new Date });
                        //chatDetails.chat.push({ msg: dto.usermsg, id: dto.senderId });
                        updateBody = { chat: chatDetails.chat, updated: new Date };
                    }
                    else if (dto.senderId == '2') {
                        updateBody = { chat: { user: { _id: dto.senderId, name: 'Admin', avatar: 'https://storage.googleapis.com/mbestbucket/dum_2022-08-23T203316.209Z_my.png' }, 'text': dto.usermsg, _id: (0, uuid_1.v4)(), createdAt: new Date }, updated: new Date };
                    }
                    else {
                        updateBody = { chat: { user: { _id: dto.senderId, name: chatDetails.senderName, avatar: chatDetails.senderImage ? chatDetails.senderImage : 'https://storage.googleapis.com/mbestbucket/dum_2022-08-23T203316.209Z_my.png' }, 'text': dto.usermsg, _id: (0, uuid_1.v4)(), createdAt: new Date }, updated: new Date };
                    }
                }
                const rest = yield this.messageDAO.updateC(chatDetails._id.toString(), updateBody);
                if (chatDetails.receiverId && chatDetails.receiverId != '' && chatDetails.senderId && chatDetails.senderId != '') {
                    this.SendNotificationWS('chat', 'started', chatDetails._id, rest.senderId);
                    this.SendNotificationWS('chat', 'started', chatDetails._id, rest.receiverId);
                }
                else {
                    this.SendNotificationWS('chat', 'New', chatDetails._id, rest.senderId);
                }
                // (()=>{
                //EMAIL SENDER BY SUBODH(27.Feb)
                // var nodemailer = require('nodemailer');
                // const url: string = 'https://storage.googleapis.com/mbewebsite/index.html#';
                // const accountActivationLink: string = `${url}/account-activation?token=`;
                // var transporter = nodemailer.createTransport({
                //   service: 'gmail',
                //   port:465,
                //   secure: true,
                //   auth: {
                //     user: 'Social@multibrandselectronics.com',
                //     pass: 'navqbqczsyqfpcky'
                //   }
                // });
                // var mailOptions = {
                //   from: 'Social@multibrandselectronics.com',
                //   to: "imasif1010@gmail.com",
                //   subject: 'Account Activation | MBE',
                //   //text: `Passsword reset link ${variableAndValues[2].value}`,
                //   html: 'Hi '+ `` +'<br><br>To activate your account, <a href="' + `${accountActivationLink}` + '"><b>Click here</b></a>.<br><br>Should you have any questions or issues, email us at support@mbe.com<br><br><br><b>-The MBE team.</b>'
                // };
                // transporter.sendMail(mailOptions, function(error:any, info:any){
                //   if (error) {
                //   // res.json({ success: false, status: error });
                //     console.log(error);
                //   } else {
                //     //return true;
                //     //res.json('Email sent: ' + info.response);
                //     console.log('Email sent: ' + info.response);
                //   }
                // });
                // })()
                res.json({ success: true, chatId: chatDetails._id.toString() });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getChatForUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.query.userId;
                console.log('####userId', userId);
                const data = yield this.messageDAO.getByFilter({
                    $and: [
                        { senderId: userId },
                        { status: { $not: { $eq: "Completed" } } }
                    ]
                });
                console.log('####data', data);
                if (data) {
                    // if (data.senderImage !== '') {
                    //   if(data.senderId == '2'){
                    //     data.senderImage = data.senderImage;
                    //   } else {
                    //     const filenameL = data.senderImage.split('?')[0];
                    //     const filename = filenameL.split('/')[filenameL.split('/').length - 1];
                    //     const url = await this.readPreSignedUrl(filename);
                    //     data.senderImage = url;
                    //   }
                    // }
                    res.json({ success: true, data });
                }
                else {
                    res.json({ success: false, status: 'No data found!', data: [] });
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
                // res.json({ success: false, status:'No data found!', data: [] });
            }
        });
        this.getChatByChatId = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const chatId = req.params.id;
                const data = yield this.messageDAO.getById(chatId.toString());
                // if (data.senderImage !== '' || data.senderImage == null) {
                //   const filenameL = data.senderImage.split('?')[0];
                //   const filename = filenameL.split('/')[filenameL.split('/').length - 1];
                //   const url = await this.readPreSignedUrl(filename);
                //   data.senderImage = url;
                // }
                res.json({ success: true, data });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getChats = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.query.userId;
                const status = req.query.status;
                const filter = {};
                if (userId && userId != '') {
                    filter.$or = [{ senderId: userId, status: 'New' }, { receiverId: userId, status: 'New' }];
                }
                if (status && status != '') {
                    filter.status = status;
                }
                const data = yield this.messageDAO.getByFilter1(filter);
                // for (const con of data) {
                //   if (con.senderImage !== '') {
                //     const filenameL = con.senderImage.split('?')[0];
                //     const filename = filenameL.split('/')[filenameL.split('/').length - 1];
                //     const url = await this.readPreSignedUrl(filename);
                //     con.senderImage = url;
                //   }
                // }
                res.json({ success: true, data });
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
                    expires: Date.now() + 450 * 60 * 1000, // 15 minutes
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
        this.messageDAO = new message_dao_1.default();
        this.userDAO = new user_dao_1.default();
    }
    SendNotificationWS(title, body, topic, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const packbody = { title, userid: user, body, topic };
            // const ws = new WebSocket('wss://api.drop-deliveryapp.com/notification/v1/ws?roomid=' + topic);
            // ws.on('open', function open() {
            //   console.log("JSON.stringify(packbody)", JSON.stringify(packbody));
            //   ws.send(JSON.stringify(packbody));
            // });
            // ws.on('message', function incoming(message:any) {
            //   console.log('received: %s', message);
            // });
            // socket.on(topic, (msg:any)=>{
            // })
            console.log("notifcation is working");
        });
    }
}
exports.Message = Message;
//# sourceMappingURL=message.controller.js.map