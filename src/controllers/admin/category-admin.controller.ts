import express from 'express';
import CategoryDAO from '../../daos/category.dao';

import config from 'config';
import CategoryDTO from '../../dtos/category.dto';
import catchError from '../../error/catch-error';
import HandledApplicationError from '../../error/handled-application-error';
import IAuthenticatedRequest from '../../guards/authenticated.request';

export class CategoryAdmin {
  private readonly categoryDAO: CategoryDAO;

  constructor() {
    this.categoryDAO = new CategoryDAO();
  }

  public getAllCategories = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const result = await this.categoryDAO.getAllCategories();
      // for (const con of result) {
      //     const filenameL = con.images.split('?')[0];
      //     const filename = filenameL.split('/')[filenameL.split('/').length - 1];
      //     const url = await this.readPreSignedUrl(filename);
      //     con.images = url;
      //     if(con.icon != null){
      //       const filenameIcon = con.icon.split('?')[0];
      //       const filenameI = filenameIcon.split('/')[filenameIcon.split('/').length - 1];
      //       const urlIcon = await this.readPreSignedUrl(filenameI);
      //       con.icon = urlIcon;
      //     }
      // }
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public getActiveCategories = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const result = await this.categoryDAO.getActiveCategories();
      // for (const con of result) {
      //   const filenameL = con.images.split('?')[0];
      //   const filename = filenameL.split('/')[filenameL.split('/').length - 1];
      //   const url = await this.readPreSignedUrl(filename);
      //   con.images = url;
      //   if(con.icon != null){
      //     const filenameIcon = con.icon.split('?')[0];
      //     const filenameI = filenameIcon.split('/')[filenameIcon.split('/').length - 1];
      //     const urlIcon = await this.readPreSignedUrl(filenameI);
      //     con.icon = urlIcon;
      //   }
      // }
      res.json(result.sort((y, x) => +new Date(x.added.at) - +new Date(y.added.at)));
    } catch (err) {
      catchError(err, next);
    }
  }

  public deleteCategory = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const result = await this.categoryDAO.delete(id);
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public changeCategoryStatus = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const status = req.body;
      const result = await this.categoryDAO.statusChange(id, status);
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public updateCategory = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const categoryData: CategoryDTO = req.body;
      const result = await this.categoryDAO.update(id, categoryData);
      res.json({ success: true, status: 'success' });
    } catch (err) {
      catchError(err, next);
    }
  }

  public getCategoryById = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const result = await this.categoryDAO.getById(id);
      // const filenameL = result.images.split('?')[0];
      // const filename = filenameL.split('/')[filenameL.split('/').length - 1];
      // const url = await this.readPreSignedUrl(filename);
      // result.images = url;

      // const filenameC = result.images.split('?')[0];
      // const filenameIc = filenameC.split('/')[filenameC.split('/').length - 1];
      // const urlIc = await this.readPreSignedUrl(filenameIc);
      // result.icon = urlIc;
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public addNewCategory = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const dto: CategoryDTO = req.body;
      // check for a valid category and sub category
      if (dto.name) {
        const name = dto.name;
        const resu = await this.getAllCat();
        if (resu.includes(name)) {
          throw new HandledApplicationError(401, 'category already exist');
        }
      }
      // check if image string is not empty
      if (!dto.images) {
        throw new HandledApplicationError(401, 'image required');
      }
      const result = await this.categoryDAO.create(dto);
      res.json({ status: 'Success' });
    } catch (err) {
      catchError(err, next);
    }
  }

  private async getAllCat(): Promise<any> {
    const cat = await this.categoryDAO.getAllCategories();
    const categoryList = [];
    for (const val of cat) {
      categoryList.push(val.name);
    }
    return categoryList;
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
