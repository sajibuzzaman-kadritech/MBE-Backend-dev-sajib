import express from 'express';
import mongoose from 'mongoose';
import RatingReviewDAO from '../daos/ratingReview.dao';
import {RatingReviewDTO, reviewCustomOutput}  from '../dtos/ratingReview.dto';
//import reviewCustomOutput from '../dtos/ratingReview.dto';
import UserDAO from '../daos/user.dao';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
export class RatingReview {
  private readonly ratingReviewDAO: RatingReviewDAO;
  private readonly userDAO: UserDAO;
  constructor() {
    this.ratingReviewDAO = new RatingReviewDAO();
    this.userDAO = new UserDAO();
  }
  public getByUserId = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const result = await this.ratingReviewDAO.getByUserId(id);
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }
  public getByItemId = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const userName ='';
      const result = await this.ratingReviewDAO.getByItemId(id);
      console.log(result);
      const l: reviewCustomOutput[] = [];
      if(result){
        //const user = await this.userDAO.getByIds(result[0].userId);
        //result.push(userId::RatingReviewDTO:user.name.toString());
        let total=0
        for (let i = 0; i < result.length; i++) {
          total +=result[i].rating;
        }
        const ratingTotal= total/result.length;
        for (let i = 0; i < result.length; i++) {
          let userDetails;
                
          if (result[i].userId !== "") {
            userDetails = await this.userDAO.getById(result[i].userId);
          }

        const resBody: reviewCustomOutput = {
          itemId: result[i].itemId,
          userId: result[i].userId,
          review: result[i].review,
          rating: result[i].rating.toString(),
          deleted: result[i].deleted,
          username:userDetails.name,
          _id: result[i]._id,
          added: result[i].added,
         
      };
      l.push(resBody);
    }
        res.json({ success: true, data: l,avgRating:ratingTotal});
      }
    } catch (err) {
      catchError(err, next);
    }
  }
  public getById = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const result = await this.ratingReviewDAO.getById(id);
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public getAllRatingsandReview = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const result = await this.ratingReviewDAO.getAllRatingReviews();
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public deleteRatingReview = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const result = await this.ratingReviewDAO.delete(id);
      res.json(result);
    } catch (err) {
      catchError(err, next);
    }
  }

  public addNewRatingReview = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const dto: RatingReviewDTO = req.body;
      const result = await this.ratingReviewDAO.create(dto);
      res.json({ success: true, status: 'added successfully!' });
    } catch (err) {
      catchError(err, next);
    }
  }

  public updateReviewRating = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.id;
      const dto: RatingReviewDTO = req.body;
      const result = this.ratingReviewDAO.update(id, dto);
      res.json({ success: true, status: 'updated successful!' });
    } catch (err) {
      catchError(err, next);
    }
  }
}
