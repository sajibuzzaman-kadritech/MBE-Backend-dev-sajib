import { ObjectId, ObjectID } from 'bson';
import config from 'config';
import express from 'express';
import DealsDAO from '../daos/deals.dao';
import ItemsDAO from '../daos/items.dao';
import DealsDTO from '../dtos/deals.dto';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
import moment from "moment";

export class Deals {
  private readonly DealsDAO: DealsDAO;
  private readonly itemsDAO: ItemsDAO;
  constructor() {
    this.DealsDAO = new DealsDAO();
    this.itemsDAO = new ItemsDAO();
  }

  public getAllDealsAdmin = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const result = await this.DealsDAO.getAllDeals();
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public getActiveDeals = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const result = await this.DealsDAO.getActiveDeals();
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public deleteDeal = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const result = await this.DealsDAO.delete(id);

      if(result.items.length > 0){
        const deal = 'none';
        const ids = result.items.map((item,index)=> {
          return item._id
        });

        const updateMulti = await this.itemsDAO.updateMultiple(ids, {deal});
      }

      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public changeDealStatus = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const {status} = req.body;
      const result = await this.DealsDAO.statusChange(id, {status});

      if(result.items.length > 0){
        if(status == 'Active'){
          const deal = 'none';
          const ids = result.items.map((item,index)=> {
            return item._id
          });
          const updateMulti = await this.itemsDAO.updateMultiple(ids, {deal});
        }else{
          const deal = result.name;
          const ids = result.items.map((item,index)=> {
            return item._id
          });
          const updateMulti = await this.itemsDAO.updateMultiple(ids, {deal});
        }
      }
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public updateDeal = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const dealData: DealsDTO = req.body;


      dealData.items = dealData.items.map((item,index)=>{
        let obj = {...item};

        obj._id = new ObjectID(obj._id);

        return obj;
      });

      const result = await this.DealsDAO.update(id, dealData);

      if(result.items.length > 0){
        const deal = result.name;
        const ids = result.items.map((item,index)=> {
          return new ObjectId(item._id).toString()
        });

        const updateMulti = await this.itemsDAO.updateMultiple(ids, {deal});

      }

      res.json({ success: true, status: 'success' });
    } catch (err) {
      catchError(err, next);
    }
  }

  public getDealById = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const result = await this.DealsDAO.getById(id);
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public addNewDeal = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const dto: DealsDTO = req.body;
      const currentTime = moment().toISOString();
      dto.added = {
        // @ts-ignore
        at: currentTime
      }
      if (!dto.images) {
        throw new HandledApplicationError(401, 'deal image required');
      }
      const result = await this.DealsDAO.create(dto);
      res.json({ status: 'success' });
    } catch (err) {
      catchError(err, next);
    }
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
