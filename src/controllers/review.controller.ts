import config from 'config';
import express from 'express';
import mongoose from 'mongoose';
import ReviewDAO from '../daos/review.dao';
import UserDAO from '../daos/user.dao';
import ReviewDTO, { reviewCustomOutput } from '../dtos/review.dto';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';

export class Review {

    private readonly reviewDAO: ReviewDAO;
    private readonly userDAO: UserDAO;
    constructor() {
        this.reviewDAO = new ReviewDAO();
        this.userDAO = new UserDAO();
    }

    public addReview = async (
      req: IAuthenticatedRequest,
      res: express.Response,
      next: express.NextFunction
  ) => {
      try {
        const dto: ReviewDTO = req.body;
        if (dto.senderId == '') {
          throw new HandledApplicationError(401, 'user id is required');
        }
        if (dto.productId == '') {
          throw new HandledApplicationError(401, 'product id is required');
        }
        const result = await this.reviewDAO.create(dto);
           res.json({ success: true, reviewId: result._id.toString() });
            return;
       } catch (err) {
          catchError(err, next);
      }
  }

  public getAllReview = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
      
     const review_id = req.params.id;
     if(review_id){
       
      const data =  await this.reviewDAO.getById(review_id.toString());
      if(data){
        const user = await this.userDAO.getById(data.senderId);
        res.json({ success: true, data:data,userName1:user.name });
      } else {
        res.json({ success: false, status:'No data found!' });
      }
    } else {
      const filter: any = { };
      filter.$or = [{ status: 'Active' }, {status: 'Not Active' }];
      
      const data = await this.reviewDAO.getByFilter1(filter);
      if(data){
        const user = await this.userDAO.getById(data[0].senderId);
        res.json({ success: true, data:data,userName:user.name });
      } else {
        res.json({ success: false, status:'No data found!' });
      }
    }
      
    } catch (err) {
        catchError(err, next);
    }
  }


  public getReviewByProductId = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      
      let productId = '';
      if (req.params.id && req.params.id !== '') {
        productId = req.params.id.toString();
      }
      if (productId === '') {
        throw new HandledApplicationError(417, 'invalid productId');
      }
      const resultBody: reviewCustomOutput[] = [];
      const data = await this.reviewDAO.getByProductId(productId);
      if (!data) {
        
        res.json({ success: false, status:'No data found!' });
      } else {
        for (const d of data) {
          
           const user = await this.userDAO.getById(d.senderId);
           //resultBody.username=user.name;
           //const body: reviewCustomOutput = d;
           const body: reviewCustomOutput = {
            senderId: d.senderId,
            productId: d.productId,
            message: d.message,
            rating: d.rating,
            username: user.name,
            _id: d._id,
            added: d.added
          };
          resultBody.push(body);

        }
        res.json({ success: true, data: resultBody });
      }
    } catch (err) {
      catchError(err, next);
    }
  }

  public getRatingByProductId = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      
      let productId = '';
      if (req.params.id && req.params.id !== '') {
        productId = req.params.id.toString();
      }
      if (productId === '') {
        throw new HandledApplicationError(417, 'invalid productId');
      }
      const data = await this.reviewDAO.getByProductId(productId);
    
      if (!data) {
        res.json({ success: false, status:'No data found!' });
      } else {

        let total=0;
        for (let i = 0; i < data.length; i++) {
          total += parseInt(data[i].rating);
        }
        
        const ratingTotal= total/data.length;
        res.json({ success: true, data: data,avgRating:ratingTotal });
      }
    } catch (err) {
      catchError(err, next);
    }
  }

   


}
