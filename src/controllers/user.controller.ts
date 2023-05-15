import bcrypt from 'bcryptjs';
import config from 'config';
import express from 'express';
import * as admin from 'firebase-admin';
import jwt_decode from 'jwt-decode';
import AddressDAO from '../daos/address.dao';
import UserDAO from '../daos/user.dao';
import { AllUsers, UserDTO, UserGoogleDTO } from '../dtos/user.dto';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
import CartDAO from '../daos/cart.dao';
import moment from "moment";
const jwt = require('jsonwebtoken');

// @ts-ignore
export class User {
	private readonly userDAO: UserDAO;
	private readonly addressDAO: AddressDAO;
	private readonly cartDAO: CartDAO;
	constructor() {
		this.userDAO = new UserDAO();
		this.addressDAO = new AddressDAO();
		this.cartDAO = new CartDAO();
	}

	public addUser = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const dto: UserDTO = req.body;
			const existingUser: UserDTO = await this.userDAO.getByEmail(
				req.body.email
			);
			if (existingUser) {
				throw new HandledApplicationError(409, 'email id already registered');
			}
			const hashedPassword: string = await this.generateHash(
				'multibrandelectronicsmbes',
				req.body.password
			);
			dto.password = hashedPassword;
			const currentTime = moment().toISOString();
			dto.created = {
				// @ts-ignore
				at: currentTime
			}

			dto.updated = {
				// @ts-ignore
				at: currentTime
			}

			const result = await this.userDAO.create(dto);
			const token = this.generateToken(result._id, result.email);
			const result2 = this.userDAO.updateRememberToken(result._id, token);
			//SEND ACTIVATION LINK
			//EMAIL SENDER BY SUBODH(27.Feb)
			var nodemailer = require('nodemailer');
			const url: string =
				'https://storage.googleapis.com/mbewebsite/index.html#';
			const accountActivationLink: string = `https://multibrandselectronics.com/activate/${token}`;
			var transporter = nodemailer.createTransport({
				service: 'gmail',
				port: 465,
				secure: true,
				auth: {
					user: 'Social@multibrandselectronics.com',
					pass: 'navqbqczsyqfpcky',
				},
			});
			var mailOptions = {
				from: 'Social@multibrandselectronics.com',
				to: result.email,
				subject: 'Account Activation | MBE',
				//text: `Passsword reset link ${variableAndValues[2].value}`,
				html:
					'Hi ' +
					`${result.name}` +
					'<br><br>To activate your account, <a href="' +
					`${accountActivationLink}` +
					'"><b>Click here</b></a>.<br><br>Should you have any questions or issues, email us at support@mbe.com<br><br><br><b>-The MBE team.</b>',
			};

			transporter.sendMail(mailOptions, function (error: any, info: any) {
				if (error) {
					// res.json({ success: false, status: error });
					console.log(error);
				} else {
					//return true;
					//res.json('Email sent: ' + info.response);
					console.log('Email sent: ' + info.response);
				}
			});

			console.log('log-token', token);

			res.json({
				success: true,
				token,
				status:
					'User successfully Signed up, please check your email to verify your account',
			});

			//END SEND LINK
			//res.json({ success: true, token, status: 'registered successfully check email for account activation' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public deleteUserAccount = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const result = await this.userDAO.deleteAccount(id);
			res.json({ data: 'success' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public changeStatus = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const status = req.body;
			const result = await this.userDAO.statusChange(id, status);
			res.json({ data: 'success' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public deleteStatus = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const result = await this.userDAO.delete1(id);
			res.json({ data: 'success' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public updateProfilePhoto = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {

		try {
			const id = req.params.id;
			//const image = JSON.stringify(req.body.image);
			const image = req.body.image;
			if (image === undefined) {
				throw new HandledApplicationError(401, 'profile image is required');
			}
			const img = image;
			const result = await this.userDAO.updatePhoto(id, img);
			res.json({ data: 'success' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public updateUser = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const dto: UserDTO = req.body;
			let userId = '';

			if (req.query.userId && req.query.userId !== '') {
				userId = req.query.userId.toString();
			}
			if (userId === '') {
				throw new HandledApplicationError(417, 'invalid userId');
			}

			const user = await this.userDAO.getById(userId);
			//res.json(user);
			if (!user) {
				//this.accountDoesNotExist();
				res.json({ success: false, status: 'account does not exist!' });
			} else {
				const currentTime = moment().toISOString();
				dto.updated = {
					// @ts-ignore
					at: currentTime
				}
				const result = await this.userDAO.update(user._id, dto);
				if (result) {
					res.json({ success: true, status: 'user updated successfully' });
				} else {
					throw new HandledApplicationError(
						500,
						'unable to update user details'
					);
				}
			}
		} catch (err) {
			catchError(err, next);
		}
	};

	public getUserByEmail = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const email = req.header('email');
			const user = await this.userDAO.getByEmail(email);
			if (!user) {
				//this.accountDoesNotExist();
				res.json({ success: false, status: 'account does not exist!' });
			} else {
				const paddress = await this.addressDAO.getPrimaryAddressForUser(
					user._id
				);
				res.json({
					success: true,
					userDetails: user,
					primaryAddress: paddress,
				});
			}
		} catch (err) {
			catchError(err, next);
		}
	};

	public getUserById = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const token = req.header('Authorization');
			console.log('token###getUserById = ' + token);
			if (token && token.split(' ').length > 1) {
				const decoded: any = jwt_decode(token.split(' ')[1]);
				console.log('decoded###getUserById = ', decoded.id);
				const user = await this.userDAO.getByEmail(decoded.email);

				console.log('######user###', user);
				if (!user) {
					//this.accountDoesNotExist();
					res.json({ success: false, status: 'account does not exist!' });
				} else {
					const paddress = await this.addressDAO.getPrimaryAddressForUser(
						user._id
					);
					res.json({
						success: true,
						userDetails: user,
						primaryAddress: paddress,
					});
				}
			} else {
				throw new HandledApplicationError(417, 'invalid token');
			}
		} catch (err) {
			catchError(err, next);
		}
	};
	public getUserByUserId = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			let userId = '';
			if (req.query.userId && req.query.userId !== '') {
				userId = req.query.userId.toString();
			}
			if (userId === '') {
				throw new HandledApplicationError(417, 'invalid userId');
			}
			const user = await this.userDAO.getById(userId);
			if (!user) {
				//this.accountDoesNotExist();
				res.json({ success: false, status: 'account does not exist!' });
			} else {
				const paddress = await this.addressDAO.getPrimaryAddressForUser(
					user._id
				);
				res.json({
					success: true,
					userDetails: user,
					primaryAddress: paddress,
				});
			}
		} catch (err) {
			catchError(err, next);
		}
	};

	public getUserSettingByUserId = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			let userId = '';
			if (req.query.userId && req.query.userId !== '') {
				userId = req.query.userId.toString();
			}
			if (userId === '') {
				throw new HandledApplicationError(417, 'invalid userId');
			}
			const user = await this.userDAO.getById(userId);
			if (!user) {
				//this.accountDoesNotExist();
				res.json({ success: false, status: 'account does not exist!' });
			} else {
				const paddress = await this.addressDAO.getPrimaryAddressForUser(
					user._id
				);
				res.json({ success: true, userDetails: user });
			}
		} catch (err) {
			catchError(err, next);
		}
	};

	public login = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const dto: UserDTO = req.body;
			const email = dto.email;
			if (!email) {
				throw new Error('invalid Email Address');
			}
			const user = await this.userDAO.getByEmail(email);
			if (!user) {
				res.json({ success: false, status: 'account does not exist!' });
				return;
			}
			if (user.status != 'Active') {
				res.json({
					success: false,
					status: 'Sorry your account is not active!',
				});
				return;
			}

			if (dto.fcmToken) {
				user.fcmToken = dto.fcmToken;

				const updateUser = await this.userDAO.update(user._id, user);
			}

			const passSecret = await this.hashComparision(
				'multibrandelectronicsmbes',
				req.body.password
			);
			const result = bcrypt.compareSync(passSecret, user.password);
			if (result) {
				const token = this.generateToken(user._id, user.email);
				res.json({ success: true, token, status: 'success', role: user.role });
			} else {
				this.invalidCredentials();
			}
		} catch (err) {
			catchError(err, next);
		}
	};

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

	public googleSignUp = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const idToken = req.params.idToken;
			let tokenBody: any;
			admin
				.auth()
				.verifyIdToken(idToken)
				.then(async (decodedToken) => {
					tokenBody = decodedToken;
					const body = {
						type: 'GoogleSignIn',
						uid: tokenBody.uid,
						name: tokenBody.name,
						emailVerified: true,
						email: tokenBody.email,
						deleted: true,
						termsAndConditions: true,
					};
					const dto: UserGoogleDTO = body;
					const result = await this.userDAO.createGoogle(dto);
					const token = this.generateToken(result._id, result.email);
					res.json({ success: true, token, status: 'registered successfully' });
				})
				.catch((error) => {
					catchError(error, next);
				});
		} catch (err) {
			catchError(err, next);
		}
	};

	public googleLogin = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const idToken = req.params.idToken;
			const typeoff = req.body.loginType;
			let tokenBody: any;

			tokenBody = req.body.tokenBody;
			const user = await this.userDAO.getByEmail(tokenBody.email);

			if (!user) {
				const currentTime = moment().toISOString();

				const body = {
					type: typeoff,
					uid: tokenBody.uid,
					name: tokenBody.name,
					emailVerified: true,
					email: tokenBody.email,
					deleted: false,
					termsAndConditions: true,
					profilePhoto: tokenBody.profilePhoto,
					status: 'Active',
					fcmToken: req.body.fcmToken,
					created: {at: currentTime}
				};
				const dto: UserGoogleDTO = body;

				const result = await this.userDAO.createGoogle(dto);
				// console.log("###result", result);
				const token = this.generateToken(result._id, result.email);

				res.json({ success: true, token, status: 'registered successfully' });
				return;
			} else {
				const reactivatedUser = await this.userDAO.reactivateDeletedAccount(
					user._id
				);
				const token = this.generateToken(reactivatedUser._id, user.email);
				res.json({ success: true, token, status: 'success' });
				return;
			}

			if (user.status != 'Active') {
				res.json({
					success: false,
					status: 'Sorry your account is not active!',
				});
				return;
			}

			const token = this.generateToken(user._id, user.email);

			//@ts-ignore
			if (req.body.fcmToken) {
				//@ts-ignore
				user.fcmToken = req.body.fcmToken;
				const updateUser = await this.userDAO.update(user._id, user);
			}

			res.json({ success: true, token, status: 'success' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public getAllUsers = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const user = await this.userDAO.getAllUsers();
			const l: AllUsers[] = [];
			const filter2: any = {};
			for (const con of user) {
				filter2.userId = con._id;
				const result = await this.cartDAO.getOrderedCartsByUserId(filter2);
				con.orders = result.length;

				const paddress = await this.addressDAO.getPrimaryAddressForUser(
					con._id
				);
				const resBody: AllUsers = { userDetails: con, address: paddress };
				l.push(resBody);
			}
			res.json(l);
		} catch (err) {
			catchError(err, next);
		}
	};

	public getSiteUsers = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const user = await this.userDAO.getSiteUsers();
			const l: AllUsers[] = [];
			for (const con of user) {
				const paddress = await this.addressDAO.getPrimaryAddressForUser(
					con._id
				);
				const resBody: AllUsers = { userDetails: con, address: paddress };
				l.push(resBody);
			}
			res.json(l);
		} catch (err) {
			catchError(err, next);
		}
	};

	private readonly readPreSignedUrl = async (fileName: string) => {
		try {
			const { Storage } = require('@google-cloud/storage');

			// Creates a client
			const storage = new Storage({
				projectId: config.get<string>('gcp.projectId'),
				keyFilename: 'for-poc-325210-a7e014fe2cab.json',
			});
			const options = {
				version: 'v4',
				action: 'read',
				expires: Date.now() + 450 * 10 * 1000, // 15 minutes
			};
			const [url] = await storage
				.bucket(config.get<string>('gcp.bucket'))
				.file(fileName)
				.getSignedUrl(options);
			return url;
		} catch (err) {
			return '';
		}
	};
	private accountDoesNotExist() {
		throw new HandledApplicationError(401, 'account does not exist!');
	}
	private invalidCredentials() {
		throw new HandledApplicationError(401, 'invalid credentials!');
	}
	private generateToken(id: any, email: any): string {
		const token = jwt.sign({ id, email }, 'multibrandelectronicsmbes');
		return token;
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

	public signupTokenVerify = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			//const email =  req.body.email;
			const email_token = req.body.token;
			const user = await this.userDAO.getByToken(email_token);
			if (!user) {
				res.json({ success: false, status: 'Sorry invalid token!' });
			}
			if (user.remember_token == email_token) {
				const user2 = await this.userDAO.statusChangeActive(user._id);
				if (user2) {
					res.json({
						success: true,
						status: 'Email token verified and your account is activated now.',
					});
				} else {
					res.json({
						success: true,
						status: 'Token verify but status is not updated on DB!',
					});
				}
			} else {
				res.json({ success: false, status: 'Sorry your token miss matched!' });
			}
		} catch (err) {
			catchError(err, next);
		}
	};

	public forgetTokenVerifySetNpwd = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const email_token = req.body.token;
			const user = await this.userDAO.getByToken(email_token);
			if (!user) {
				res.json({ success: false, status: 'Sorry invalid token!' });
			}
			if (!req.body.new_password) {
				res.json({ success: false, status: 'New password is required!' });
			}
			const hashedPassword: string = await this.generateHash(
				'multibrandelectronicsmbes',
				req.body.new_password
			);
			if (user.remember_token == email_token) {
				const user2 = await this.userDAO.updatePass(user.email, hashedPassword);
				if (user2) {
					res.json({
						success: true,
						status:
							'Email token verified and your password is successfully updated.',
					});
				} else {
					res.json({
						success: true,
						status: 'Token verify but status is not updated on DB!',
					});
				}
			} else {
				res.json({ success: false, status: 'Sorry your token miss matched!' });
			}
		} catch (err) {
			catchError(err, next);
		}
	};

	public addAdminUser = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const dto: UserDTO = req.body;
			const existingUser: UserDTO = await this.userDAO.getByEmail(
				req.body.email
			);
			if (existingUser) {
				throw new HandledApplicationError(409, 'email id already registered');
			}
			const hashedPassword: string = await this.generateHash(
				'multibrandelectronicsmbes',
				req.body.password
			);
			dto.password = hashedPassword;
			const currentTime = moment().toISOString();
			dto.created = {
				// @ts-ignore
				at: currentTime
			}
			const result = await this.userDAO.create(dto);
			const token = this.generateToken(result._id, result.email);
			const result2 = this.userDAO.updateRememberToken(result._id, token);

			res.json({
				success: true,
				token,
				status: 'Admin user registered successfully',
				result,
			});
		} catch (err) {
			catchError(err, next);
		}
	};


	
	public addAdminUserDefault = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const dto: UserDTO = null;
			const existingUser: UserDTO = await this.userDAO.getByEmail(
				"admin@gmail.com"
			);



			if (existingUser) {
				throw new HandledApplicationError(409, 'email id already registered');
			}
			const hashedPassword: string = await this.generateHash(
				'multibrandelectronicsmbes',
				"123456"
			);
			dto.password = hashedPassword;
			const currentTime = moment().toISOString();
			dto.created = {
				// @ts-ignore
				at: currentTime
			}
			dto.name = "Super Admin";
			dto.status = "Active";
			dto.type = "Email";
			const result = await this.userDAO.create(dto);
			const token = this.generateToken(result._id, result.email);
			const result2 = this.userDAO.updateRememberToken(result._id, token);

			res.json({
				success: true,
				token,
				status: 'Admin user registered successfully',
				result,
			});
		} catch (err) {
			catchError(err, next);
		}
	};



}
