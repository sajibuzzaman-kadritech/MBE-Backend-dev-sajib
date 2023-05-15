import config from 'config';
import express from 'express';
import jwt_decode from 'jwt-decode';
import AddressDAO from '../daos/address.dao';
import UserDAO from '../daos/user.dao';
import AddressDTO from '../dtos/address.dto';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
import moment from "moment";

export class Address {
    private readonly addressDAO: AddressDAO;
    private readonly userDAO: UserDAO;
    constructor() {
        this.addressDAO = new AddressDAO();
        this.userDAO = new UserDAO();
    }

    public getPrimaryUserAddresses = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const token = req.header('Authorization');
            if (token && token.split(' ').length > 1) {
                const decoded: any = jwt_decode(token.split(' ')[1]);
                const user = await this.userDAO.getByEmail(decoded.email);
                if (!user) {
                    throw new HandledApplicationError(401, 'user account does not exist!');
                } else {
                    const result = await this.addressDAO.getPrimaryAddressForUser(decoded.id);
                    if (result) {
                        res.json({ success: true, data: result });
                    } else {
                        throw new HandledApplicationError(500, 'unable to get address for user');
                    }
                }
            } else {
                throw new HandledApplicationError(417, 'invalid token');
            }
        } catch (err) {
            catchError(err, next);
        }
    }

    public getUserAddresses = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            let userId = '';
            if (req.query.userId && req.query.userId !== '') {
                userId = req.query.userId.toString();
            }

            const user = await this.userDAO.getById(userId);
            if (!user) {
                throw new HandledApplicationError(401, 'user account does not exist!');
            } else {
                const result = await this.addressDAO.getByUserId(userId);
                if (result) {
                    res.json({ success: true, data: result });
                } else {
                    throw new HandledApplicationError(500, 'unable to get address for user');
                }
            }
        } catch (err) {
            catchError(err, next);
        }
    }

    public updateAddress = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const id = req.params.id;
            const addressData: AddressDTO = req.body;
            const currentTime = moment().toISOString();
            addressData.added = {
                // @ts-ignore
                at: currentTime
            }
            const result = await this.addressDAO.update(id, addressData);
            if (result) {
                res.json({ success: true, status: 'success' });
            } else {
                throw new HandledApplicationError(500, 'unable to update address');
            }

        } catch (err) {
            catchError(err, next);
        }
    }

    public getAddressById = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const id = req.params.id;
            const result = await this.addressDAO.getById(id);
            res.json(result);
        } catch (err) {
            catchError(err, next);
        }
    }

    public addNewAddress = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const dto: AddressDTO = req.body;
            const currentTime = moment().toISOString();
            dto.added = {
                // @ts-ignore
                at: currentTime
            }
            const user = await this.userDAO.getById(dto.userId);
            if (!user) {
                throw new HandledApplicationError(401, 'account does not exist!');
            } else {
                const paddress = await this.addressDAO.getPrimaryAddressForUser(dto.userId);
                if (paddress) {
                    const result = await this.addressDAO.create(dto);
                    if (result) {
                        res.json({ success: true, status: 'address added successfully' });
                    } else {
                        throw new HandledApplicationError(500, 'unable to add address');
                    }
                } else {
                    const pdto: AddressDTO = dto;
                    pdto.primary = true;
                    const result = await this.addressDAO.create(pdto);
                    if (result) {
                        res.json({ success: true, status: 'address added successfully' });
                    } else {
                        throw new HandledApplicationError(500, 'unable to add address');
                    }
                }
            }
        } catch (err) {
            catchError(err, next);
        }
    }

    public deleteAddress = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
      ) => {
        try {
          const id = req.params.id;
          const result = await this.addressDAO.delete(id);
          res.json(result);
        } catch (err) {
          catchError(err, next);
        }
      }

}
