import config from 'config';
import express from 'express';
import mongoose from 'mongoose';
import ShippingtaxDAO from '../daos/shippingtax.dao';
import UserDAO from '../daos/user.dao';
import ShippingtaxDTO from '../dtos/shippingtax.dto';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
const { PubSub } = require('@google-cloud/pubsub');
export class Shippingtax {

    private readonly shippingtaxDAO: ShippingtaxDAO;
    private readonly userDAO: UserDAO;
    constructor() {
        this.shippingtaxDAO = new ShippingtaxDAO();
        this.userDAO = new UserDAO();
    }

    public addShippingTax = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
          const dto: ShippingtaxDTO = req.body;
          if (dto.shipping_value == '' && dto.shipping_type == '') {
            throw new HandledApplicationError(401, 'type and value is required');
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
              const result = await this.shippingtaxDAO.create(dto);
             
              res.json({ success: true, shippingId: result._id.toString() });
              return;
          
          //res.json({ success: true, chatId: data._id.toString() });
        } catch (err) {
            catchError(err, next);
        }
    }

    public updateShippingtax = async (
      req: IAuthenticatedRequest,
      res: express.Response,
      next: express.NextFunction
  ) => {
      try {
        const dto: ShippingtaxDTO = req.body;
        const tax_id = req.params.id;
        const shippingtaxDetails = await this.shippingtaxDAO.getById(tax_id.toString());
        if (!shippingtaxDetails) {
          throw new HandledApplicationError(401, 'shipping tax id does not exist!');
        }
        const updateBody: any = { };
          if(dto.shipping_value){
            updateBody.shipping_value = dto.shipping_value;
           }
           if(dto.shipping_type){
            updateBody.shipping_type = dto.shipping_type;
           }
           if(dto.shipping_product){
            updateBody.shipping_product = dto.shipping_product;
           }
          if(dto.shipping_amount_type){
            updateBody.shipping_amount_type = dto.shipping_amount_type;
           }
         if(dto.status){
          updateBody.status = dto.status;
         }
         updateBody.updated = new Date;
       
        const rest = await this.shippingtaxDAO.updateC(shippingtaxDetails._id.toString(), updateBody);
        res.json({ success: true, shippingId: shippingtaxDetails._id.toString() });
      } catch (err) {
          catchError(err, next);
      }
    }

    public deleteShipping = async (
      req: IAuthenticatedRequest,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const id = req.params.id;
        const result = await this.shippingtaxDAO.delete(id);
        res.json(result);
      } catch (err) {
        catchError(err, next);
      }
    }

    public getAllShippingtaxes = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
      
     const tax_id = req.query.tax_id;
     if(tax_id){
       
      const data =  await this.shippingtaxDAO.getById(tax_id.toString());
      if(data){
        res.json({ success: true, data });
      } else {
        res.json({ success: false, status:'No data found!' });
      }
    } else {
      const filter: any = { };
      filter.$or = [{ status: 'Active' }, {status: 'Not Active' }];
      
      const data = await this.shippingtaxDAO.getByFilter1(filter);
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
