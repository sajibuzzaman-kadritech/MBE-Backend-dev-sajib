import config from 'config';
import express from 'express';
import mongoose from 'mongoose';
import AdminsettingsDAO from '../daos/adminsettings.dao';
import UserDAO from '../daos/user.dao';
import tmcDAO from '../daos/tmc.dao';
import AdminsettingsDTO from '../dtos/adminsettings.dto';
import tmcDTO from '../dtos/tmc.dto';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
const { PubSub } = require('@google-cloud/pubsub');
export class Adminsettings {

    private readonly adminsettingsDAO: AdminsettingsDAO;
    private readonly userDAO: UserDAO;
    private readonly tmcDAO: tmcDAO;
    constructor() {
        this.adminsettingsDAO = new AdminsettingsDAO();
        this.userDAO = new UserDAO();
        this.tmcDAO = new tmcDAO();
    }

    public addESTDelivery = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
          const dto: AdminsettingsDTO = req.body;
          if (dto.est_delivery > 0) {
            throw new HandledApplicationError(401, 'est_delivery in days is required');
          }
          //res.json(req.body);
          //const data = await this.messageDAO.getByFilter({ $or: [{ senderId: dto.senderId, status: 'New' }, { receiverId: dto.senderId, status: 'New' }] });
          
            /*
              const senderDetails = await this.userDAO.getById(dto.senderId);
              dto.senderName = senderDetails.name;
              dto.senderImage = senderDetails.profilePhoto;
              dto.senderEmail = senderDetails.email;
              
              if (dto.receiverId && dto.receiverId != '') {
                //const recieiverDetails = await this.userDAO.getById(dto.receiverId);
                dto.receiverName = 'Admin';//recieiverDetails.name;
                dto.receiverImage = 'dsfcsf';//recieiverDetails.profilePhoto;
              }
              */
              //this.SendNotificationWS('chat', 'New', 'broadcast', dto.senderId);
              //this.SendNotificationWS('chat', 'New', 'broadcast', dto.receiverId);
              const result = await this.adminsettingsDAO.create(dto);
             
              res.json({ success: true, Id: result._id.toString() });
              return;
          
          //res.json({ success: true, chatId: data._id.toString() });
        } catch (err) {
            catchError(err, next);
        }
    }

    public updateAdminSettings = async (
      req: IAuthenticatedRequest,
      res: express.Response,
      next: express.NextFunction
  ) => {
      try {
        const dto: AdminsettingsDTO = req.body;
        const settings_id = req.params.id;
        const adminsettingsDetails = await this.adminsettingsDAO.getById(settings_id.toString());
        if (!adminsettingsDetails) {
          throw new HandledApplicationError(401, 'admin settings id does not exist!');
        }
        let settingStatus;
        if(dto.status == null){
          settingStatus = 'Active';
        } else {
          settingStatus = dto.status;
        }
        let updateBody = { };
        if (dto.est_delivery) {
          if (dto.est_delivery > 0) {
            updateBody = { est_delivery:dto.est_delivery,status:settingStatus, updated: new Date };
          } else {
            updateBody = { est_delivery: adminsettingsDetails.est_delivery, updated: new Date };
          }
        }
        const rest = await this.adminsettingsDAO.updateC(adminsettingsDetails._id.toString(), updateBody);
        res.json({ success: true, Id: adminsettingsDetails._id.toString() });
      } catch (err) {
          catchError(err, next);
      }
    }

    public getAllAdminSettings = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
      
     const id = req.query.id;
     if(id){
       
      const data =  await this.adminsettingsDAO.getById(id.toString());
      if(data){
        res.json({ success: true, data });
      } else {
        res.json({ success: false, status:'No data found!' });
      }
    } else {
      const filter: any = { };
      filter.$or = [{ status: 'Active' }, {status: 'Not Active' }];
      
      const data = await this.adminsettingsDAO.getByFilter1(filter);
      //const data = await this.deliveryDAO.getByFilter({ $or: [{ status: 'Active' },{ status: 'Not Active' }] });
      if(data){
        res.json({ success: true, data });
      } else {
        res.json({ success: false, status:'No data found!' });
      }
    }
      
    } catch (err) {
        catchError(err, next);
    }
  }

  public getAllTMC = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
      
     const id = req.query.id;
     if(id){
       
      const data =  await this.tmcDAO.getById(id.toString());
      if(data){
        res.json({ success: true, data });
      } else {
        res.json({ success: false, status:'No data found!' });
      }
    } else {
      const filter: any = { };
      filter.$or = [{ status: 'Active' }, {status: 'Not Active' }];
      
      const data = await this.tmcDAO.getByFilter1(filter);
      //const data = await this.deliveryDAO.getByFilter({ $or: [{ status: 'Active' },{ status: 'Not Active' }] });
      if(data){
        res.json({ success: true, data });
      } else {
        res.json({ success: false, status:'No data found!' });
      }
    }
      
    } catch (err) {
        catchError(err, next);
    }
  }

  public addTMC = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
      const dto: tmcDTO = req.body;
      if (!dto.message) {
        throw new HandledApplicationError(401, 'message is required');
      }
        const result = await this.tmcDAO.create(dto);
        res.json({ success: true, Id: result._id.toString() });
        return;
    } catch (err) {
        catchError(err, next);
    }
}

  public updateTMC = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
      const dto: tmcDTO = req.body;
      const tmc_id = req.params.id;
      const tmcDetails = await this.tmcDAO.getById(tmc_id.toString());
      if (!tmcDetails) {
        throw new HandledApplicationError(401, 'tmc does not exist!');
      }
      let tmcStatus;
      if(dto.status == null){
        tmcStatus = 'Active';
      } else {
        tmcStatus = dto.status;
      }
      let updateBody = { };
      if (dto.message) {
        if (dto.message) {
            updateBody = { message:dto.message,status:tmcStatus, updated: new Date };
        } else {
            updateBody = { message: tmcDetails.message, updated: new Date };
        }
      }
      const rest = await this.tmcDAO.updateC(tmcDetails._id.toString(), updateBody);
      res.json({ success: true, Id: tmcDetails._id.toString() });
    } catch (err) {
        catchError(err, next);
    }
  }

/*
    public getChatByChatId = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
      const chatId = req.params.id;
      const data = await this.messageDAO.getById(chatId.toString());
      if (data.senderImage !== '') {
        const filenameL = data.senderImage.split('?')[0];
        const filename = filenameL.split('/')[filenameL.split('/').length - 1];

        const url = await this.readPreSignedUrl(filename);
        data.senderImage = url;

      }
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
    for (const con of data) {
      if (con.senderImage !== '') {
        const filenameL = con.senderImage.split('?')[0];
        const filename = filenameL.split('/')[filenameL.split('/').length - 1];

        const url = await this.readPreSignedUrl(filename);
        con.senderImage = url;

      }
    }
    res.json({ success: true, data });
  } catch (err) {
      catchError(err, next);
  }
}

    private async SendNotificationWS(title: string, body: string, topic: string, user: string): Promise<any> {
      const packbody = { title, userid: user, body, topic };
      const ws = new WebSocket('wss://api.drop-deliveryapp.com/notification/v1/ws?roomid=' + topic);
      ws.on('open', function open() {
        ws.send(JSON.stringify(packbody));
      });
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
 */
  }
