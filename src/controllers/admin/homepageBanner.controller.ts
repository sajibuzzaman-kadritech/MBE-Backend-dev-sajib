import config from 'config';
import express from 'express';
import BannerDAO from '../../daos/homePageBanner.dao';
import BannerDTO from '../../dtos/homePageBanner.dto';
import catchError from '../../error/catch-error';
import HandledApplicationError from '../../error/handled-application-error';
import IAuthenticatedRequest from '../../guards/authenticated.request';

export class BannerAdmin {
  private readonly bannerDAO: BannerDAO;

  constructor() {
    this.bannerDAO = new BannerDAO();
  }

  public getAllBanners = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const result = await this.bannerDAO.getAllBanners();
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public getActiveBanners = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const bannertype = req.query.type;
      const filter: any = { status: 'Active', delete: false };
      if (bannertype && bannertype !== '') {
        filter.bannertype = bannertype;
      }
      const result = await this.bannerDAO.getActiveBanners(filter);
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public deleteBanners = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const result = await this.bannerDAO.delete(id);
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public changeBannerStatus = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const status = req.body;
      const result = await this.bannerDAO.statusChange(id, status);
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public updateBanner = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const bannerData: BannerDTO = req.body;
      const result = await this.bannerDAO.update(id, bannerData);
      res.json({ success: true, status: 'success' });
    } catch (err) {
      catchError(err, next);
    }
  }

  public getBannerById = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const result = await this.bannerDAO.getById(id);
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public addNewBanner = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const dto: BannerDTO = req.body;
      if (!dto.images) {
        throw new HandledApplicationError(401, 'image required');
      }
      const result = await this.bannerDAO.create(dto);
      res.json({ status: 'Success' });
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

          // console.log('uuurrrrllll', url);
        return url;
      } catch (err) {
        return '';
      }
    }
  }
