import express from 'express';
import { isNull } from 'util';
import NotificationDAO from '../daos/notification.dao';
import NotificationDTO from '../dtos/notification.dto';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
export class Notification {

    private readonly notificationDAO: NotificationDAO;
    constructor() {
        this.notificationDAO = new NotificationDAO();
    }

    public scheduleNotification = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
      ) => {
        try {
            const dto: NotificationDTO = req.body;
            const check = await this.notificationDAO.getByItemId(dto.itemId, dto.email);
            if (check) {
                res.json({ msg: 'notification already scheduled' });
                return;
            }
            const result = await this.notificationDAO.create(dto);
            res.json({ msg: 'scheduled successfully' });
          } catch (err) {
            catchError(err, next);
          }
    }

    public getAllNotifications = async (
      req: IAuthenticatedRequest,
      res: express.Response,
      next: express.NextFunction
    ) => {
        try {
          let userid = '';
          if (req.query.userid && req.query.userid !== '') {
            userid = req.query.userid.toString();
          }
          if (userid === '') {
            throw new HandledApplicationError(417, 'invalid userId');
          }
          const result = await this.notificationDAO.getByUserId(userid);
           
            // let notify:any = [];
            // for (let i = 0; i < result.length; i++) {
            //  notify[i] = {id:result[i]._id,type:result[i].type,name:result[i].name,email:result[i].email,date:result[i].added.at};
            // }
            
          res.json({ success: true, data:result });
        } catch (err) {
            catchError(err, next);
        }
    }
}
