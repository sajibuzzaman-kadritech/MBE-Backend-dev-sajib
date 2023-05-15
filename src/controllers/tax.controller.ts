import config from 'config';
import express from 'express';
import mongoose from 'mongoose';
import taxDAO from '../daos/tax.dao';
import UserDAO from '../daos/user.dao';
import taxDTO from '../dtos/tax.dto';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
const { PubSub } = require('@google-cloud/pubsub');
export class Tax {

    private readonly taxDAO: taxDAO;
    private readonly userDAO: UserDAO;
    constructor() {
        this.taxDAO = new taxDAO();
        this.userDAO = new UserDAO();
    }

    public addTax = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
          const dto: taxDTO = req.body;
          if (dto.tax_value == null && dto.tax_type == null && dto.tax_name == null) {
            throw new HandledApplicationError(401, 'All filed is required');
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
              const result = await this.taxDAO.create(dto);
             
              res.json({ success: true, taxId: result._id.toString() });
              return;
          
          //res.json({ success: true, chatId: data._id.toString() });
        } catch (err) {
            catchError(err, next);
        }
    }

    public updateTax = async (
      req: IAuthenticatedRequest,
      res: express.Response,
      next: express.NextFunction
  ) => {
      try {
        const dto: taxDTO = req.body;
        const tax_id = req.params.id;
        const taxDetails = await this.taxDAO.getById(tax_id.toString());
        if (!taxDetails) {
          throw new HandledApplicationError(401, 'tax id does not exist!');
        }
        const updateBody: any = { };
          if(dto.tax_value){
            updateBody.tax_value = dto.tax_value;
           }
           if(dto.tax_type){
            updateBody.tax_type = dto.tax_type;
           }
           if(dto.tax_name){
            updateBody.tax_name = dto.tax_name;
           }
         
         if(dto.status){
          updateBody.status = dto.status;
         }
         updateBody.updated = new Date;
       
        const rest = await this.taxDAO.updateC(taxDetails._id.toString(), updateBody);
        res.json({ success: true, taxId: taxDetails._id.toString() });
      } catch (err) {
          catchError(err, next);
      }
    }

    public deleteTax = async (
      req: IAuthenticatedRequest,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const id = req.params.id;
        const result = await this.taxDAO.delete(id);
        res.json(result);
      } catch (err) {
        catchError(err, next);
      }
    }

    public getAllTaxes = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
      
     const tax_id = req.query.tax_id;
     if(tax_id){
       
      const data =  await this.taxDAO.getById(tax_id.toString());
      if(data){
        res.json({ success: true, data });
      } else {
        res.json({ success: false, status:'No data found!' });
      }
    } else {
      const filter: any = { };
      filter.$or = [{ status: 'Active' }, {status: 'Not Active' }];
      
      const data = await this.taxDAO.getByFilter1(filter);
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

  }
