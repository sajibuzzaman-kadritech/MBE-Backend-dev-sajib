import bcrypt from 'bcryptjs';
import { json } from 'body-parser';
import express from 'express';
import jwt_decode from 'jwt-decode';
import UserDAO from '../daos/user.dao';
import { UserDTO } from '../dtos/user.dto';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
export class ForgotPassword {
  private readonly userDAO: UserDAO;
  constructor() {
    this.userDAO = new UserDAO();
  }

  public readonly forgotPassword = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      //res.json(req.body.email);
     //await this.emailSendingTest();
      const user = await this.checkEmailExists(req.body.email);
      const sendStatus: boolean =
        await this.createForgotPasswordTokenAndSendMail(user, res);
      if (sendStatus) {
        return res.json({
          message: 'email sent successfully',
          success: true,
          hasSecurityQuestions: false,
        });
      } else {
        throw new HandledApplicationError(
          417,
          'error while sending email, please contact support team'
        );
      }
    } catch (err) {
      catchError(err, next);
    }
  }

  public changePassword = async (
    req: IAuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const newPass = req.body.password;
    const token = req.body.token;
    const decoded: any = jwt_decode(token);
    const existingUser: UserDTO = await this.userDAO.getByEmail(decoded.email);
    if (!existingUser) {
      throw new HandledApplicationError(409, 'account Doesnot exist');
    }
    const hashedPassword: string = await this.generateHash(
      'multibrandelectronicsmbes',
      newPass
    );
    const result = await this.userDAO.updatePass(decoded.email, hashedPassword);
    res.json({ success: true, token, status: 'password updated successfully' });
  }

  public async generateHash(
    prefixSecretKey: string,
    password: string
  ): Promise<string> {
    const passwordModified = await this.hashComparision(
      prefixSecretKey,
      password
    );
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(passwordModified, salt);
    return hashedPassword;
  }

  private async hashComparision(
    prefixSecretKey: string,
    password: string
  ): Promise<string> {
    const prefixKeyArray = prefixSecretKey.match(/.{1,4}/g);
    const passwordModified =
      prefixKeyArray[2] +
      password +
      prefixKeyArray[1] +
      password +
      prefixKeyArray[0] +
      password +
      prefixKeyArray[3] +
      password;
    return passwordModified;
  }
  private generateToken(id: any, email: any): string {
    const token = jwt.sign({ id, email }, 'multibrandelectronicsmbes');
    return token;
  }
  private async createForgotPasswordTokenAndSendMail(
    user: UserDTO,
    res: express.Response
  ) {
    const token = this.generateToken(user._id, user.email);
    let name = '';
    if (user.name) {
      name = `${user.name}`;
    }
    const sendStatus: boolean = true;
    await this.sendForgetPasswordMail(user.email, name, token);
    return sendStatus;
  }
  private async sendForgetPasswordMail(
    email: string,
    firstName: string,
    jwtToken: any
  ): Promise<boolean> {
    const url: string = 'https://storage.googleapis.com/mbewebsite';
    const resetPasswordLink: string = `${url}/resetpassword?token=${jwtToken}`;
    return await this.sendResetPasswordMail(
      email,
      firstName,
      resetPasswordLink
    );
  }

  private async sendResetPasswordMail(
    to: string,
    username: string,
    resetLink: string
  ): Promise<boolean> {
    const variablesAndValues: any[] = [
      { key: 'username', value: username },
      { key: 'email', value: to },
      { key: 'resetLink', value: resetLink },
    ];

    return await this.readTemplate2(to, 'reset password', variablesAndValues);
  }

  private async readTemplate(
    to: string,
    subject: string,
    variableAndValues: any[]
  ): Promise<boolean> {
    const credentials = {
      accessKeyId: '',
      secretAccessKey: '',
    };
    AWS.config.update({
      credentials,
      region: '',
    });
    const params = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `Passsword reset link ${variableAndValues[2].value}`,
          },
          Text: {
            Charset: 'UTF-8',
            Data: `Passsword reset link ${variableAndValues[2].value}`,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Password reset link',
        },
      },
      Source: '',
    };
    const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
      .sendEmail(params)
      .promise();

    return sendPromise
      .then((data: any) => {
        return true;
      })
      .catch((err: any) => {
        const a = 10;
      });
  }

  private async checkEmailExists(req: any) {
    const user: UserDTO = await this.userDAO.getByEmail(req);
    if (user === null) {
      throw new HandledApplicationError(
        400,
        'invalid email address provided, please try again'
      );
    }
    return user;
  }

  private async readTemplate2(
    to: string,
    subject: string,
    variableAndValues: any[]
  ): Promise<boolean> {
   /* const credentials = {
      accessKeyId: '',
      secretAccessKey: '',
    };
    AWS.config.update({
      credentials,
      region: '',
    });
    */
    const params = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `Passsword reset link ${variableAndValues[2].value}`,
          },
          Text: {
            Charset: 'UTF-8',
            Data: `Passsword reset link ${variableAndValues[2].value}`,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Password reset link',
        },
      },
      Source: '',
    };
    //EMAIL SENDER BY SUBODH(26.Feb)
    var nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'subodhiat8@gmail.com',
            pass: 'Bz21@3456'
          }
        });
        var mailOptions = {
          from: 'subodhiat8@gmail.com',
          to: to,
          subject: 'Password Reset Link | MBE',
          //text: `Passsword reset link ${variableAndValues[2].value}`,
          html: 'Hi '+ `${variableAndValues[0].value}` +'<br><br>To reset your password, <a href="' + `${variableAndValues[2].value}` + '"><b>Click here</b></a>.<br><br>Should you have any questions or issues, email us at support@mbe.com<br><br><br><b>-The MBE team.</b>'
        };
      
        transporter.sendMail(mailOptions, function(error:any, info:any){
          if (error) {
            return false;
            //res.json(error);
            console.log(error);
          } else {
            return true;
            //res.json('Email sent: ' + info.response);
            console.log('Email sent: ' + info.response);
          }
        });
        const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
      .sendEmail(params)
      .promise();
        return sendPromise
      .then((data: any) => {
        return true;
      })
      .catch((err: any) => {
        const a = 10;
      });
    /*
    const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
      .sendEmail(params)
      .promise();

    return sendPromise
      .then((data: any) => {
        return true;
      })
      .catch((err: any) => {
        const a = 10;
      });
      */
  }

  private async emailSendingTest (email:any) {
        var nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'subodhiat8@gmail.com',
            pass: 'Bz21@3456'
          }
        });

        var mailOptions = {
          from: 'subodhiat8@gmail.com',
          to: 'subodh6580@gmail.com',
          subject: 'Sending Email using Node.js',
          text: 'That was test message!'
        };

        transporter.sendMail(mailOptions, function(error:any, info:any){
          if (error) {
            //res.json(error);
            console.log(error);
          } else {
            //res.json('Email sent: ' + info.response);
            console.log('Email sent: ' + info.response);
          }
        });
  }

}
