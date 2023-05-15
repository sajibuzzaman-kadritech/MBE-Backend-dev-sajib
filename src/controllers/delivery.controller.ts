import config from 'config';
import express from 'express';
import mongoose from 'mongoose';
import DeliveryDAO from '../daos/delivery.dao';
import UserDAO from '../daos/user.dao';
import DeliveryDTO from '../dtos/delivery.dto';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
import moment from "moment";
const { PubSub } = require('@google-cloud/pubsub');
export class Delivery {

    private readonly deliveryDAO: DeliveryDAO;
    private readonly userDAO: UserDAO;
    constructor() {
        this.deliveryDAO = new DeliveryDAO();
        this.userDAO = new UserDAO();
    }

    public addDeliveryCity = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
          const dto: DeliveryDTO = req.body;
            const currentTime = moment().toISOString();
            // @ts-ignore
            dto.added = currentTime
          if (dto.delivery_type == '' && dto.city_name == '') {
            throw new HandledApplicationError(401, 'delivery type is required');
          }
              const result = await this.deliveryDAO.create(dto);
             
              res.json({ success: true, deliveryId: result._id.toString() });
              return;
        } catch (err) {
            catchError(err, next);
        }
    }

    public updateDeliveryCity = async (
      req: IAuthenticatedRequest,
      res: express.Response,
      next: express.NextFunction
  ) => {
      try {
        const dto: DeliveryDTO = req.body;
          const currentTime = moment().toISOString();
          // @ts-ignore
          dto.updated = currentTime
        const delivery_id = req.params.id;
        const deliveryDetails = await this.deliveryDAO.getById(delivery_id.toString());
        if (!deliveryDetails) {
          throw new HandledApplicationError(401, 'delivery city does not exist!');
        }
        
          const updateBody: any = { };
          if(dto.city_name){
            updateBody.city_name = dto.city_name;
           }
           if(dto.delivery_type){
            updateBody.delivery_type = dto.delivery_type;
           }
          if(dto.status){
            updateBody.status = dto.status;
          }
         updateBody.updated = new Date;
        const rest = await this.deliveryDAO.updateC(deliveryDetails._id.toString(), updateBody);
        res.json({ success: true, deliveryId: deliveryDetails._id.toString() });
      } catch (err) {
          catchError(err, next);
      }
    }

    public getAllDeliveryCities = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
      
     const delivery_id = req.query.delivery_id;
     if(delivery_id){
       
      const data =  await this.deliveryDAO.getById(delivery_id.toString());
      if(data){
        res.json({ success: true, data });
      } else {
        res.json({ success: false, status:'No data found!' });
      }
    } else {
      const filter: any = { };
      filter.$or = [{ status: 'Active' }, {status: 'Not Active' }];
      
      const data = await this.deliveryDAO.getByFilter1(filter);
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

  public deleteCity = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const result = await this.deliveryDAO.delete(id);
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  }
