import config from 'config';
import express from 'express';
import mongoose from 'mongoose';
import MessageDAO from '../daos/message.dao';
import UserDAO from '../daos/user.dao';
import MessageDTO from '../dtos/message.dto';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
const { PubSub } = require('@google-cloud/pubsub');
import { v4 as uuidv4 } from 'uuid';
const AWS = require('aws-sdk');


export class Message {

    private readonly messageDAO: MessageDAO;
    private readonly userDAO: UserDAO;
    constructor() {
        this.messageDAO = new MessageDAO();
        this.userDAO = new UserDAO();
    }

    public startChat = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
          const dto: MessageDTO = req.body;
          const status = req.query.status;
          if (dto.senderId == '' && dto.receiverId == '') {
            throw new HandledApplicationError(401, 'sender Id is required');
          }
          
          const data = await this.messageDAO.getByFilter({$and: [
            { senderId: dto.senderId},
            { status: { $not: { $eq: "Completed" } } }
         ]});


          if (!data) {
             if(dto.senderId == '2'){
              dto.senderName = 'Admin';
              dto.senderImage = 'https://storage.googleapis.com/mbebucket/dummy.png';
              dto.senderEmail = 'admin@mbe.com';
             } else {
              const senderDetails = await this.userDAO.getById(dto.senderId);
              console.log('####senderDetails', senderDetails);
              dto.senderName = senderDetails.name;
              dto.senderImage = senderDetails.profilePhoto ? senderDetails.profilePhoto : 'https://storage.googleapis.com/mbestbucket/dum_2022-08-23T203316.209Z_my.png';;
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
                dto.receiverName = 'Admin';//recieiverDetails.name;
                dto.receiverImage = 'dsfcsf';//recieiverDetails.profilePhoto;
              }
              //'https://storage.googleapis.com/mbebucket/dummy.png'
              
              // const uuidv4 = require('uuid/v4');
              const pdto: MessageDTO = dto;
              pdto.chat = [{user:{_id:dto.senderId,name:dto.senderName,avatar:dto.senderImage},'text':dto.chat[0].text,_id:uuidv4(),createdAt:new Date}];
              this.SendNotificationWS('chat', 'New', 'broadcast', dto.senderId);
              console.log("dto.senderId", dto.senderId);
              //this.SendNotificationWS('chat', 'New', 'broadcast', dto.receiverId);
              const result = await this.messageDAO.create(pdto);



              (()=>{
                var nodemailer = require('nodemailer');
                // send  mail to admin
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    port:465,
                    secure: true,
                    auth: {
                        user: 'Social@multibrandselectronics.com',
                        pass: 'navqbqczsyqfpcky'
                    }
                });
  
                let emalhtml=`<!DOCTYPE html>
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
                    html:emalhtml
                };
                transporter.sendMail(mailOptions, function(error:any, info:any){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
              })();

            
            res.json({ success: true, chatId: result._id.toString() });
            return;
          }



          console.log('has data');
          
          const chatDetails = data;
          let updateBody = { };
          // const uuidv4 = require('uuid/v4');
          
          this.SendNotificationWS('chat', 'New', chatDetails._id, dto.senderId);
          chatDetails.chat.push({user:{_id:dto.senderId,name:chatDetails.senderName,avatar:chatDetails.senderImage},'text':dto.chat[0].text,_id:uuidv4(),createdAt:new Date});
          //chatDetails.chat.push({ msg: dto.usermsg, id: dto.senderId });
          updateBody = { chat: chatDetails.chat, updated: new Date };

          const rest = await this.messageDAO.updateC(chatDetails._id.toString(), updateBody);

          res.json({ success: true, chatId: chatDetails._id.toString() });
        } catch (err) {
            catchError(err, next);
        }
    }

    public updateChat = async (
      req: IAuthenticatedRequest,
      res: express.Response,
      next: express.NextFunction
  ) => {

      // console.log('update###########asdasdsadsadsasadsadsadasdsa', req.params.id);
      try {
        const dto: MessageDTO = req.body;
        const chatId = req.params.id;
        // console.log('asdsadsadsadsadsadsadsadsadasdassadsadsadsadsadsdsad');
        if (dto.senderId == '' && dto.receiverId == '') {
          throw new HandledApplicationError(401, 'sender Id and receiver Id is required');
        }
        const chatDetails = await this.messageDAO.getById(chatId.toString());
        if (!chatDetails) {
          throw new HandledApplicationError(401, 'chat id doesnot exist');
        }
        let updateBody = { };
        // const uuidv4 = require('uuid/v4');
        if (dto.receiverId && dto.receiverId !== '') {
           // const recieiverDetails = await this.userDAO.getById(dto.receiverId);
            updateBody = { status: 'Started', receiverjointime: new Date, updated: new Date, receiverId: dto.receiverId, receiverName: 'Admin', receiverImage: '' };
            this.SendNotificationWS('chat', 'Taken', 'broadcast', chatDetails.senderId);
            console.log("chatDetails.senderId",chatDetails.senderId);
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
            chatDetails.chat.push({user:{_id:dto.senderId,name:chatDetails.senderName,avatar:'https://storage.googleapis.com/mbestbucket/dum_2022-08-23T203316.209Z_my.png'},'text':dto.usermsg,_id:uuidv4(),createdAt:new Date});
            //chatDetails.chat.push({ msg: dto.usermsg, id: dto.senderId });
            updateBody = { chat: chatDetails.chat, updated: new Date };
          } else if(dto.senderId == '2') {
            updateBody = { chat: {user:{_id:dto.senderId,name:'Admin',avatar:'https://storage.googleapis.com/mbestbucket/dum_2022-08-23T203316.209Z_my.png'},'text':dto.usermsg,_id:uuidv4(),createdAt:new Date}, updated: new Date };
          }
           else {
            updateBody = { chat: {user:{_id:dto.senderId,name:chatDetails.senderName,avatar:chatDetails.senderImage ? chatDetails.senderImage : 'https://storage.googleapis.com/mbestbucket/dum_2022-08-23T203316.209Z_my.png'},'text':dto.usermsg,_id:uuidv4(),createdAt:new Date}, updated: new Date };
          }

        }
        const rest = await this.messageDAO.updateC(chatDetails._id.toString(), updateBody);

        if (chatDetails.receiverId && chatDetails.receiverId != '' && chatDetails.senderId && chatDetails.senderId != '') {
          this.SendNotificationWS('chat', 'started', chatDetails._id, rest.senderId);
          this.SendNotificationWS('chat', 'started', chatDetails._id, rest.receiverId);
        } else {
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

      } catch (err) {
          catchError(err, next);
      }
    }

    public getChatForUser = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
      const userId = req.query.userId;
      console.log('####userId',userId);
      const data = await this.messageDAO.getByFilter({
        $and: [
           { senderId: userId},
           { status: { $not: { $eq: "Completed" } } }
        ]
      });
      console.log('####data',data);

     if(data){

     
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
    } else {
      res.json({ success: false, status:'No data found!', data: [] });
    }
    } catch (err) {
        catchError(err, next);
        // res.json({ success: false, status:'No data found!', data: [] });
    }
  }

    public getChatByChatId = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
      const chatId = req.params.id;
      const data = await this.messageDAO.getById(chatId.toString());
      // if (data.senderImage !== '' || data.senderImage == null) {
      //   const filenameL = data.senderImage.split('?')[0];
      //   const filename = filenameL.split('/')[filenameL.split('/').length - 1];

      //   const url = await this.readPreSignedUrl(filename);
      //   data.senderImage = url;

      // }
      res.json({ success: true, data });
    } catch (err) {
        catchError(err, next);
    }
  }
    public getChats = async (
  req: IAuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const userId = req.query.userId;
    const status = req.query.status;
    const filter: any = { };
    if (userId && userId != '') {
      filter.$or = [{ senderId: userId, status: 'New' }, { receiverId: userId, status: 'New' }];
    }
    if (status && status != '') {
      filter.status = status;
    }
    const data = await this.messageDAO.getByFilter1(filter);
    // for (const con of data) {
    //   if (con.senderImage !== '') {
    //     const filenameL = con.senderImage.split('?')[0];
    //     const filename = filenameL.split('/')[filenameL.split('/').length - 1];

    //     const url = await this.readPreSignedUrl(filename);
    //     con.senderImage = url;

    //   }
    // }
    res.json({ success: true, data });
  } catch (err) {
      catchError(err, next);
  }
}

    private async SendNotificationWS(title: string, body: string, topic: string, user: string): Promise<any> {
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

    }
    private readonly readPreSignedUrl = async (fileName: string
    ) => {
      try {
        const { Storage } = require('@google-cloud/storage');

        // Creates a client
        const storage = new Storage(
          {
            projectId: config.get<string>('gcp.projectId'),
            keyFilename: 'for-poc-325210-a7e014fe2cab.json',
          }
        );
        const options = {
          version: 'v4',
          action: 'read',
          expires: Date.now() + 450 * 60 * 1000, // 15 minutes
        };
        const [url] = await storage
          .bucket(config.get<string>('gcp.bucket'))
          .file(fileName)
          .getSignedUrl(options);
        return url;
      } catch (err) {
        return '';
      }
    }

  }
