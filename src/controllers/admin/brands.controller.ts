import config from 'config';
import express from 'express';
import BrandsDAO from '../../daos/brands.dao';
import BrandsDTO from '../../dtos/brands.dto';
import catchError from '../../error/catch-error';
import HandledApplicationError from '../../error/handled-application-error';
import IAuthenticatedRequest from '../../guards/authenticated.request';

export class Brands {
  private readonly BrandsDAO: BrandsDAO;
  constructor() {
    this.BrandsDAO = new BrandsDAO();
  }

  public getAllBrands = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const result = await this.BrandsDAO.getAllBrands();
      // for (const con of result) {
      //   const filenameL = con.images.split('?')[0];
      //   const filename = filenameL.split('/')[filenameL.split('/').length - 1];
      //   const url = await this.readPreSignedUrl(filename);
      //   con.images = url;
      // }
      res.json(result.sort((y, x) => +new Date(x.added.at) - +new Date(y.added.at)));
    } catch (err) {
      catchError(err, next);
    }
  }

  public getActiveBrands = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const result = await this.BrandsDAO.getActiveBrands();
      // for (const con of result) {
      //   const filenameL = con.images.split('?')[0];
      //   const filename = filenameL.split('/')[filenameL.split('/').length - 1];
      //   const url = await this.readPreSignedUrl(filename);
      //   con.images = url;
      // }
      res.json(result.sort((y, x) => +new Date(x.added.at) - +new Date(y.added.at)));
    } catch (err) {
      catchError(err, next);
    }
  }

  public deleteBrand = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const result = await this.BrandsDAO.delete(id);
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public changeBrandStatus = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const status = req.body;
      const result = await this.BrandsDAO.statusChange(id, status);
      res.json({ data: 'success' });
    } catch (err) {
      catchError(err, next);
    }
  }

  public updateBrand = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const brandData: BrandsDTO = req.body;
      const result = await this.BrandsDAO.update(id, brandData);
      res.json({ success: true, status: 'success' });
    } catch (err) {
      catchError(err, next);
    }
  }

  public getBrandById = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const result = await this.BrandsDAO.getById(id);
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public addNewBrands = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const dto: BrandsDTO = req.body;
      if (!dto.images) {
        throw new HandledApplicationError(401, 'brand image required');
      }
      const result = await this.BrandsDAO.create(dto);
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
