import express from 'express';
import mongoose from 'mongoose';
import AddressDAO from '../daos/address.dao';
import CartDAO from '../daos/cart.dao';
import ItemsDAO from '../daos/items.dao';
import OrderDAO from '../daos/order.dao';
import UserDAO from '../daos/user.dao';
import {
	OrderCustomOutput,
	OrdersDTO,
	OrderUserCustomOutput,
} from '../dtos/order.dto';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
var ObjectId = require('mongodb').ObjectID;
import config from 'config';
import { AnyAaaaRecord } from 'dns';
import { exit } from 'process';
import moment from 'moment';
import AdminsettingsDAO from '../daos/adminsettings.dao';
import ShippingtaxDAO from '../daos/shippingtax.dao';
const axios = require('axios');

export class Orders {
	private readonly orderDAO: OrderDAO;
	private readonly userDAO: UserDAO;
	private readonly addressDAO: AddressDAO;
	private readonly cartDAO: CartDAO;
	private readonly shippingDAO: ShippingtaxDAO;
	private readonly itemsDAO: ItemsDAO;
	private readonly adminsettingsDAO: AdminsettingsDAO;
	constructor() {
		this.orderDAO = new OrderDAO();
		this.userDAO = new UserDAO();
		this.addressDAO = new AddressDAO();
		this.cartDAO = new CartDAO();
		this.shippingDAO = new ShippingtaxDAO();
		this.itemsDAO = new ItemsDAO();
		this.adminsettingsDAO = new AdminsettingsDAO();
	}

	public getAllOrders = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const result = await this.orderDAO.getAllOrders1();
			res.json({ success: true, data: result });
		} catch (err) {
			catchError(err, next);
		}
	};
	public getByTransactionsFilter = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			let limit: any = '100';
			let offset: any = '0';
			if (req.query.limit && req.query.limit !== '') {
				limit = req.query.limit;
			}
			if (req.query.offset && req.query.limit !== '') {
				offset = req.query.offset;
			}
			const userid = req.query.userid;
			const paymentStatus = req.query.paymentStatus;
			const orderStatus = req.query.orderStatus;
			const paymentType = req.query.paymentType;
			const from = req.query.from;
			const to = req.query.to;
			const filter: any = {};
			if (paymentStatus && paymentStatus !== '') {
				filter.paymentStatus = paymentStatus;
			}
			if (orderStatus && orderStatus !== '') {
				filter.orderStatus = { $ne: orderStatus };
			}
			if (paymentType && paymentType !== '') {
				filter.paymentType = paymentType;
			}
			if (userid && userid !== '') {
				filter.userId = userid;
			}
			if (from && to && from !== '' && to !== '') {
				filter.orderplaced = { $gte: from, $lte: to };
			}
			const orders = await this.orderDAO.getByFilter(filter, limit, offset);
			if (orders.length !== 0) {
				// console.log("orderssdddddddddddddddddddd",orders);
				const userIds = [];
				for (const order of orders) {
					userIds.push({ _id: mongoose.Types.ObjectId(order.userId) });
				}

				const users = await this.userDAO.getByIds({ $or: userIds });

				const l: OrderUserCustomOutput[] = [];
				for (let i = 0; i < orders.length; i++) {
					let userDetails = {};
					for (const sid of users) {
						if (orders[i].userId === sid._id.toString()) {
							userDetails = sid;
							break;
						}
					}
					let transdetails = {};
					if (orders[i].transactionId !== '') {
						transdetails = await this.GetPaymentDetails(
							orders[i].transactionId
						);
					}
					const resBody: OrderCustomOutput = {
						userDetails,
						paymentId: orders[i].paymentId,
						shippingAddress: 'asdsadas',
						transactionDetails: transdetails,
						ItemsOrdered: {},
						paymentType: orders[i].paymentType,
						orderStatus: orders[i].orderStatus,
						paymentStatus: orders[i].paymentStatus,
						shippingCourierId: orders[i].shippingCourierId,
						paymentsDetails: orders[i].paymentsDetails,
						_id: orders[i]._id,
						orderplaced: orders[i].orderplaced,
						updated: orders[i].updated,
						ordershipped: orders[i].ordershipped,
						orderdelivered: orders[i].orderdelivered,
						ordercancelled: orders[i].ordercancelled,
						cancellationReason: orders[i].cancellationReason,
					};
					l.push(resBody);
				}
				res.json({ success: true, data: l });
			} else {
				res.json({ status: false, message: 'No data found!' });
			}
		} catch (err) {
			catchError(err, next);
		}
	};
	public getByFilter = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			let limit: any = '100';
			let offset: any = '0';
			if (req.query.limit && req.query.limit !== '') {
				limit = req.query.limit;
			}
			if (req.query.offset && req.query.limit !== '') {
				offset = req.query.offset;
			}
			const userid = req.query.userid;
			const paymentStatus = req.query.paymentStatus;
			const orderStatus = req.query.orderStatus;
			const paymentType = req.query.paymentType;
			const from = req.query.from;
			const to = req.query.to;
			const filter: any = {};
			filter.isPaid = true;
			if (paymentStatus && paymentStatus !== '') {
				filter.paymentStatus = paymentStatus;
			}
			if (orderStatus && orderStatus !== '') {
				filter.orderStatus = orderStatus;
			}
			if (paymentType && paymentType !== '') {
				filter.paymentType = paymentType;
			}
			if (userid && userid !== '') {
				filter.userId = userid;
			}
			if (from && to && from !== '' && to !== '') {
				filter.orderplaced = { $gte: from, $lte: to };
			}
			const orders = await this.orderDAO.getByFilter(filter, limit, offset);
			// console.group("ordersssssssss");
			// console.log("ordersssssssss" , orders);
			// console.group("ordersssssssss");
			if (orders.length !== 0) {
				const shipList = [];
				const cartIds = [];
				const userIds = [];
				for (const order of orders) {
					if (order.shippingId) {
						shipList.push({ _id: mongoose.Types.ObjectId(order.shippingId) });
					}
					if (order.cartId) {
						cartIds.push({ _id: mongoose.Types.ObjectId(order.cartId) });
					}
					if (order.userId) {
						userIds.push({ _id: mongoose.Types.ObjectId(order.userId) });
					}
				}
				let shippingAddresses;
				if (shipList.length !== 0) {
					shippingAddresses = await this.addressDAO.getByIds({ $or: shipList });
				}
				const carts = await this.cartDAO.getByIds({ $or: cartIds });
				const users = await this.userDAO.getByIds({ $or: userIds });
				const l: OrderUserCustomOutput[] = [];
				for (let i = 0; i < orders.length; i++) {
					let shippingDetails = {};
					if (shippingAddresses != null) {
						for (const sid of shippingAddresses) {
							if (orders[i].shippingId === sid._id.toString()) {
								shippingDetails = sid;
								break;
							}
						}
					}
					let itemsOrdered = {};
					for (const sid of carts) {
						if (orders[i].cartId === sid._id.toString()) {
							itemsOrdered = sid;
							break;
						}
					}
					let userDetails = {};
					for (const sid of users) {
						if (orders[i].userId === sid._id.toString()) {
							userDetails = sid;
							break;
						}
					}
					let transdetails = {};
					if (orders[i].transactionId !== '') {
						transdetails = await this.GetPaymentDetails(
							orders[i].transactionId
						);
					}
					const resBody: OrderCustomOutput = {
						userDetails,
						paymentId: orders[i].paymentId,
						shippingAddress: shippingDetails,
						transactionDetails: transdetails,
						ItemsOrdered: itemsOrdered,
						paymentType: orders[i].paymentType,
						orderStatus: orders[i].orderStatus,
						paymentStatus: orders[i].paymentStatus,
						shippingCourierId: orders[i].shippingCourierId,
						paymentsDetails: orders[i].paymentsDetails,
						_id: orders[i]._id,
						orderplaced: orders[i].orderplaced,
						updated: orders[i].updated,
						ordershipped: orders[i].ordershipped,
						orderdelivered: orders[i].orderdelivered,
						ordercancelled: orders[i].ordercancelled,
						cancellationReason: orders[i].cancellationReason,
					};
					l.push(resBody);
				}
				res.json({ success: true, data: l });
			} else {
				res.json({ status: false, message: 'No data found!' });
			}
		} catch (err) {
			//console.log("Error" +err);
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
	};

	public getByUserFilter = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			let limit: any = '100';
			let offset: any = '0';
			if (req.query.limit && req.query.limit !== '') {
				limit = req.query.limit;
			}
			if (req.query.offset && req.query.limit !== '') {
				offset = req.query.offset;
			}

			const userid = req.query.userid;
			if (userid == null) {
				res.json({ status: false, message: 'Userid is required!' });
			}
			const paymentStatus = req.query.paymentStatus;
			const orderStatus = req.query.orderStatus;
			const paymentType = req.query.paymentType;
			const from = req.query.from;
			const to = req.query.to;
			const filter: any = {};
			if (userid && userid !== '') {
				filter.userId = userid;
			}
			if (paymentStatus && paymentStatus !== '') {
				filter.paymentStatus = paymentStatus;
			} else {
				filter.paymentStatus = ['Success', 'Pending'];
			}
			if (orderStatus && orderStatus !== '') {
				filter.orderStatus = orderStatus;
			}
			if (paymentType && paymentType !== '') {
				filter.paymentType = paymentType;
			}

			if (from && to && from !== '' && to !== '') {
				filter.orderplaced = { $gte: from, $lte: to };
			}

			const orders = await this.orderDAO.getByFilter(filter, limit, offset);

			if (orders == null) {
				res.json({ status: false, message: 'No data found!' });
				//res.json({'statue':true,'message':'data fetched','data':{'order_id':orders[0]._id,'1st_order_title'}});
			}

			const shipList = [];
			const cartIds = [];
			for (const order of orders) {
				if (order.shippingId) {
					shipList.push({ _id: mongoose.Types.ObjectId(order.shippingId) });
				}
				if (order.cartId) {
					cartIds.push({ _id: mongoose.Types.ObjectId(order.cartId) });
				}
			}

			// const cart_id1st = cartIds[0]._id;

			//const result222 = await this.cartDAO.getById('61fac3bb0be8a60559c609f5');

			const shippingAddresses = await this.addressDAO.getByIds({
				$or: shipList,
			});
			const carts = await this.cartDAO.getByIds({ $or: cartIds });
			console.log('cartIds', cartIds);

			console.log('carts', carts);

			const l: OrderUserCustomOutput[] = [];
			for (let i = 0; i < orders.length; i++) {
				let shippingDetails = {};
				if (shippingAddresses) {
					for (const sid of shippingAddresses) {
						if (orders[i].shippingId === sid._id.toString()) {
							shippingDetails = sid;
							break;
						}
					}
				}

				let itemsOrdered = {};

				for (const sid of carts) {
					if (orders[i].cartId === sid._id.toString()) {
						// for (const j of sid.items) {
						//
						//     // const newImages = []
						//     // for (const don of j.itemImages) {
						//     //     const filenameL = don.split('?')[0];
						//     //     const filename = filenameL.split('/')[filenameL.split('/').length - 1];
						//     //     const url = await this.readPreSignedUrl(filename);
						//     //     newImages.push(url);
						//     //     break
						//     // }
						//     // j.itemImages = newImages;
						// }
						itemsOrdered = sid;
						break;
					}
				}

				let transdetails = {};
				// console.log("orders[i].transactionId", orders[i].transactionId);
				if (orders[i].transactionId !== '') {
					transdetails = await this.GetPaymentDetails(orders[i].transactionId);
				}

				const resBody: OrderUserCustomOutput = {
					shippingAddress: shippingDetails,
					paymentId: orders[i].paymentId,
					transactionDetails: transdetails,
					ItemsOrdered: itemsOrdered,
					paymentType: orders[i].paymentType,
					orderStatus: orders[i].orderStatus,
					paymentStatus: orders[i].paymentStatus,
					shippingCourierId: orders[i].shippingCourierId,
					paymentsDetails: orders[i].paymentsDetails,
					_id: orders[i]._id,
					orderplaced: orders[i].orderplaced,
					updated: orders[i].updated,
					ordershipped: orders[i].ordershipped,
					orderdelivered: orders[i].orderdelivered,
					ordercancelled: orders[i].ordercancelled,
					cancellationReason: orders[i].cancellationReason,
				};
				l.push(resBody);
			}
			const filter2: any = {};
			filter2.userId = filter.userId;
			filter2.is_ordered = 'Yes';
			const result = await this.cartDAO.getOrderedCartsByUserId(filter2);
			//res.json(result);
			if (result == null) {
				res.json({ status: false, message: 'Sorry no order found!' });
			}
			res.json({ success: true, data: l });
			//}
		} catch (err) {
			catchError(err, next);
		}
	};

	public orderTrackingByOrderId = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id: any = req.query.orderid;
			const orderDetails: any = await this.orderDAO.getById(id);
			// console.log("###orderDetails#$#", orderDetails);

			if (orderDetails == null) {
				res.json({ status: false, message: 'Sorry no order found!' });
			}
			const userid = orderDetails.userId;
			const cartid = orderDetails.cartId;

			const result11 = await this.cartDAO.getById(cartid);
			let total = orderDetails['paymentsDetails'].totalCharges;
			let sub_total =
				orderDetails['paymentsDetails'].totalCharges -
				(orderDetails['paymentsDetails'].taxAmount +
					orderDetails['paymentsDetails'].shippingCharges);
			let taxes = orderDetails['paymentsDetails'].taxAmount;
			let shipping_fees = orderDetails['paymentsDetails'].shippingCharges;

			const resBody: any = {
				_id: result11._id,
				added: result11.added,
				userId: result11.userId,
				is_ordered: result11.is_ordered,
				items: orderDetails.items,
			};

			//let currentStatus = 'Pending';
			let ordered: any = '';
			let ordered_date: any = '';
			let packed: any = '';
			let packed_date: any = '';
			let shipped: any = '';
			let shipped_date: any = '';
			let delivery: any = '';
			let delivery_date: any = '';
			//res.json(orderDetails.updated.at);
			var today1 = moment(orderDetails.orderplaced.at).toDate();
			var tomorrow1 = moment(orderDetails.orderplaced.at)
				.add(1, 'days')
				.toDate();
			//@ts-ignore
			ordered_date = moment(today1).format('M/DD/YYYY');

			if (orderDetails.orderStatus == 'Ordered') {
				ordered = true;
				//ordered_date = orderDetails.updated.at;
			} else {
				ordered = false;
			}

			if (orderDetails.orderStatus == 'Shipped') {
				shipped = true;
				var today3 = moment(orderDetails.ordershipped.at).toDate();
				var tomorrow3 = moment(orderDetails.ordershipped.at)
					.add(2, 'days')
					.toDate();
				//@ts-ignore
				shipped_date = moment(today3).format('M/DD/YYYY');
			} else {
				shipped = false;
				var today3 = moment(orderDetails.orderplaced.at).toDate();
				var tomorrow3 = moment(orderDetails.orderplaced.at)
					.add(2, 'days')
					.toDate();
				//@ts-ignore
				shipped_date = 'Expected by ' + moment(tomorrow3).format('M/DD/YYYY');
			}
			if (orderDetails.orderStatus == 'Delivered') {
				delivery = true;
				var today4 = moment(orderDetails.orderdelivered.at).toDate();
				var tomorrow4 = moment(orderDetails.orderdelivered.at)
					.add(3, 'days')
					.toDate();
				//@ts-ignore
				delivery_date = moment(today4).format('M/DD/YYYY');

				shipped = false;
				var today3 = moment(orderDetails.ordershipped.at).toDate();
				//@ts-ignore
				shipped_date = moment(today3).format('M/DD/YYYY');
			} else {
				delivery = false;
				var today4 = moment(orderDetails.orderplaced.at).toDate();
				var tomorrow4 = moment(orderDetails.orderplaced.at)
					.add(3, 'days')
					.toDate();
				//@ts-ignore
				delivery_date = 'Expected by ' + moment(tomorrow4).format('M/DD/YYYY');
			}
			let tracking: any;
			if (orderDetails.ordercancelled.at === null) {
				var today5 = moment(orderDetails.ordercancelled.at).toDate();
				var tomorrow5 = moment(orderDetails.ordercancelled.at).toDate();
				//@ts-ignore
				let cancel_date = tomorrow5.format('M/DD/YYYY'); //'Cancelled On '+tomorrow5.toLocaleDateString("en-US");
				tracking = [
					{ title: 'Ordered', sub_title: ordered_date, iscompleted: ordered },
					{ title: 'Cancelled', sub_title: cancel_date, iscompleted: true },
				];
			} else if (orderDetails.orderStatus == 'Cancelled') {
				var cancelledAt = moment(orderDetails.ordercancelled.at).format(
					'M/DD/YYYY'
				);
				tracking = [
					{ title: 'Ordered', sub_title: ordered_date, iscompleted: ordered },
					{ title: 'Cancelled', sub_title: cancelledAt, iscompleted: true },
				];
			} else {
				tracking = [
					{ title: 'Ordered', sub_title: ordered_date, iscompleted: ordered },
					//{title:'Packed',sub_title:packed_date,iscompleted:packed},
					{
						title: 'Shipped',
						sub_title: shipped_date,
						iscompleted: shipped,
						courier_id: orderDetails.shippingCourierId,
					},
					{
						title: 'Delivery date',
						sub_title: delivery_date,
						iscompleted: delivery,
					},
				];
			}

			let orderInfo = {
				sub_total: total - taxes - shipping_fees,
				taxes: taxes,
				shipping_fees: shipping_fees,
				total_amount: total,
			};
			res.json({
				orderDetails: orderDetails,
				trackingStatus: tracking,
				orderInformation: orderInfo,
				data: resBody,
			});

			//CART DATA END
		} catch (err) {
			catchError(err, next);
		}
	};

	public getByOrderId = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;

			const result = await this.orderDAO.getById(id);
			res.json(result);
		} catch (err) {
			catchError(err, next);
		}
	};

	public getByTxnId = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const paymentId = req.params.id;

			const result = await this.orderDAO.getByPaymentId(paymentId);
			res.json(result);
		} catch (err) {
			catchError(err, next);
		}
	};

	private async SendNotificationWS(
		title: string,
		body: string,
		topic: string,
		user: string
	): Promise<any> {
		const packbody = { title, userid: user, body, topic };
	}

	public addNewOrders = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const { userId } = req.body;
			// console.log('req.body', userId);

			let user = await this.userDAO.getById(userId);

			if (user.status == 'Not Active') {
				res.json({ success: false, status: 'inactive user', data: [] });
				return;
			}

			const orderDateils = await this.orderDAO.getAllOrders2(req.body.cartId);

			const filter: any = {};
			filter.$or = [{ status: 'Active' }, { status: 'Not Active' }];
			const adminData = await this.adminsettingsDAO.getByFilter1(filter);
			//res.json(orderDateils);
			if (orderDateils.length > 0) {
				// @ts-ignore
				orderDateils?.isPaid = false;
				res.json({
					success: false,
					status: 'Order already placed!',
					data: orderDateils,
				});
			} else {
				const dto: OrdersDTO = req.body;
				const userDetails = await this.userDAO.getById(dto.userId);
				const userAddress = await this.addressDAO.getById(dto.shippingId);
				const payId = require('crypto').randomBytes(8).toString('hex');
				dto.paymentId = payId;

				// console.log("orderAdd", dto);
				if (dto.paymentType === 'COD') {
					dto.paymentType = dto.pos ? 'COD (POS)' : 'COD';
					dto.orderStatus = 'Ordered';
					dto.isPaid = true;
					const currentTime = moment().toISOString();
					dto.orderplaced = {
						// @ts-ignore
						at: currentTime
					}
					const result = await this.orderDAO.create(dto);
					const result2 = await this.cartDAO.getCartByUserId(dto.userId);
					//const result3 = await this.cartDAO.delete(result2._id);
					const result45 = await this.cartDAO.update_is_ordered(
						result2._id,
						'Yes'
					);

					this.SendNotificationWS('order', 'New', 'neworder', dto.userId);

					var nodemailer = require('nodemailer');

					axios({
						method: 'post',
						url: 'https://fcm.googleapis.com/fcm/send',
						headers: {
							Authorization:
								'Bearer AAAA960yEqE:APA91bGRnNZXOYM7EJYf-mW45szpTo5A0XoAuIafmgEyDs1P_SNcsKQriM-S1G6cgDoaldVx7VJshStKfvkyiEr2uqUWoznc6FAaCzGUmnpXCP6P-SGtaHG52u28l4hgMt8aCVSmmXol',
							'Content-Type': 'application/json',
						},
						data: {
							to: userDetails.fcmToken,
							notification: {
								body: 'Your order has been placed.',
								title: 'Order Placed',
							},
						},
					}).then((res: any) => {
						if (res) {
							(() => {
								// send confirmation mail to user
								var transporter = nodemailer.createTransport({
									service: 'gmail',
									port: 465,
									secure: true,
									auth: {
										user: 'Social@multibrandselectronics.com',
										pass: 'navqbqczsyqfpcky',
									},
								});

								let emalhtml = `<div class="message-htmlpart" id="message-htmlpart1"><!-- html ignored --><!-- head ignored --><!-- meta ignored -->
        
                            <!-- meta ignored -->
                            <style type="text/css">@font-face
                                { font-family: "Cambria Math"; }
                            @font-face
                                { font-family: Calibri; }
                            @font-face
                                { font-family: "Calibri Light"; }
                            @font-face
                                { font-family: "Proxima Nova"; }
                            
                            #message-htmlpart1 div.rcmBody p.v1MsoNormal, #message-htmlpart1 div.rcmBody li.v1MsoNormal, #message-htmlpart1 div.rcmBody div.v1MsoNormal
                                { margin: 0cm; font-size: 10.0pt; font-family: "Calibri",sans-serif; }
                            #message-htmlpart1 div.rcmBody h1
                                { mso-style-priority: 9; mso-style-link: "Heading 1 Char"; mso-margin-top-alt: auto; margin-right: 0cm; mso-margin-bottom-alt: auto; margin-left: 0cm; font-size: 24.0pt; font-family: "Calibri",sans-serif; font-weight: bold; }
                            #message-htmlpart1 div.rcmBody h2
                                { mso-style-priority: 9; mso-style-link: "Heading 2 Char"; margin-top: 2.0pt; margin-right: 0cm; margin-bottom: 0cm; margin-left: 0cm; page-break-after: avoid; font-size: 13.0pt; font-family: "Calibri Light",sans-serif; color: #2F5496; font-weight: normal; }
                            #message-htmlpart1 div.rcmBody span.v1Heading1Char
                                { mso-style-name: "Heading 1 Char"; mso-style-priority: 9; mso-style-link: "Heading 1"; font-family: "Times New Roman",serif; mso-fareast-language: EN-GB; font-weight: bold; }
                            #message-htmlpart1 div.rcmBody span.v1Heading2Char
                                { mso-style-name: "Heading 2 Char"; mso-style-priority: 9; mso-style-link: "Heading 2"; font-family: "Calibri Light",sans-serif; color: #2F5496; }
                            #message-htmlpart1 div.rcmBody span.v1apple-converted-space
                                { mso-style-name: apple-converted-space; }
                            #message-htmlpart1 div.rcmBody .v1MsoChpDefault
                                { mso-style-type: export-only; font-size: 10.0pt; }
                            @page WordSection1
                                { size: 612.0pt 792.0pt; margin: 72.0pt 72.0pt 72.0pt 72.0pt; }
                            #message-htmlpart1 div.rcmBody div.v1WordSection1
                                { }
                            
                            @list l0
                                { mso-list-id: 384643365; mso-list-template-ids: 860935196; }
                            @list l0:level1
                                { mso-level-tab-stop: 36.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level2
                                { mso-level-tab-stop: 72.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level3
                                { mso-level-tab-stop: 108.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level4
                                { mso-level-tab-stop: 144.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level5
                                { mso-level-tab-stop: 180.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level6
                                { mso-level-tab-stop: 216.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level7
                                { mso-level-tab-stop: 252.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level8
                                { mso-level-tab-stop: 288.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level9
                                { mso-level-tab-stop: 324.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l1
                                { mso-list-id: 1553690363; mso-list-template-ids: -736616126; }
                            #message-htmlpart1 div.rcmBody ol
                                { margin-bottom: 0cm; }
                            #message-htmlpart1 div.rcmBody ul
                                { margin-bottom: 0cm; }</style>
                            
                            <div class="rcmBody" lang="en-SE" link="#0563C1" vlink="#954F72" style="word-wrap: break-word">
                            <div class="v1WordSection1">
                            <p class="v1MsoNormal"><span style="font-size: 14.0pt; mso-fareast-language: EN-US">&nbsp;<!-- o ignored --></span></p>
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="800" style="width: 600.0pt; background: white; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="padding: 15.0pt 0cm 15.0pt 0cm">
                            <div align="center">
                            <table class="v1MsoNormalTable" dir="rtl" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; background: white; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td width="60%" style="width: 60.0%; padding: 0cm 0cm 0cm 0cm">
                            <p class="v1MsoNormal" dir="LTR" style="mso-margin-top-alt: 8.25pt; margin-right: 0cm; margin-bottom: 8.25pt; margin-left: 0cm; line-height: 26.65pt">
                            <b><span style="font-size: 24.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; letter-spacing: -.3pt">
                            You're all sorted.&nbsp;</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <p class="v1MsoNormal" dir="LTR" style="line-height: 3.0pt; background: #FFF895; vertical-align: top">
                            <span style="font-size: 3.0pt; font-family: &quot;Proxima Nova&quot;; color: black">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            <p class="v1MsoNormal"><span style="font-size: 11.0pt">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="800" style="width: 600.0pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="padding: 3.75pt 3.75pt 3.75pt 3.75pt">
                            <p class="v1MsoNormal"><b><span lang="EN-US" style="font-size: 13.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: -.1pt">Hello ${
															userDetails.name
														}</span></b><b><span style="font-size: 13.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: -.1pt">&nbsp;</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 3.75pt 3.75pt 3.75pt 3.75pt">
                            <p class="v1MsoNormal"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F; font-size:12pt">You've got great taste! We're so glad you chose
                            </span><span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F">MBE</span><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F">.&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 6.75pt 3.75pt 6.75pt 3.75pt">
                            <p class="v1MsoNormal" style="font-size:12pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F;">Your order
                            </span><span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F">(id: ${
															result._id
														})
                            </span><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F">has been received and is currently being processed by our crew.</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <p class="v1MsoNormal"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td width="50%" valign="top" style="width: 50.0%; background: white; padding: 0cm 0cm 0cm 0cm">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="background: white; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td colspan="2" style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                            <p style="margin: 0cm"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; text-transform: uppercase; letter-spacing: .15pt; mso-fareast-language: EN-US">ORDER SUMMARY</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                            <p style="margin: 0cm; min-width: 55px; font-size:10pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Order No:</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                            <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															result._id
														}</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                            <p style="margin: 0cm; min-width: 55px"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Order Total:</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                            <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															dto.paymentsDetails.currency
														}${
									dto.paymentsDetails.totalCharges
								}</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td valign="top" style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                            <p style="margin: 0cm; min-width: 55px"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Payment :</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                            <p style="margin: 0cm"><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif; color: black; mso-fareast-language: EN-US">${
															dto.paymentType
														}</span><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" width="305" style="width: 228.75pt; background: white; border-collapse: collapse; margin-bottom: -.75pt">
                            <tbody>
                            <tr>
                            <td style="padding: 0cm 15.0pt 4.5pt 15.0pt"></td>
                            </tr>
                            </tbody>
                            </table>
                            </td>
                            <td width="50%" valign="top" style="width: 50.0%; background: white; padding: 0cm 0cm 0cm 0cm">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="background: white; border-collapse: collapse; box-sizing: border-box">
                            <tbody>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                            <p style="margin: 0cm"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; text-transform: uppercase; letter-spacing: .15pt; mso-fareast-language: EN-US">SHIPPING ADDRESS<span class="v1apple-converted-space">&nbsp;</span></span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                            <p style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Times New Roman&quot;,serif; color: black; mso-fareast-language: EN-US">Customer name : ${
															userDetails.name
														}</span><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                            <p style="margin: 0cm"><span lang="EN-US" style="font-size: 10.0pt; font-family: 'Proxima Nova'; color: #30343F; mso-fareast-language: EN-US">
                                name: ${userAddress.name},<br/>
                                addressLine1: ${userAddress.addressLine1},<br/>
                                addressLine2: ${userAddress.addressLine2},<br/>
                                city: ${userAddress.city},<br/>
                                state: ${userAddress.state},<br/>
                                postalCode: ${userAddress.postalCode},<br/>
                                country: ${userAddress.country},<br/>
                                addressType: ${userAddress.addressType},<br/>
                                mobile: ${userAddress.mobile}.
                            </span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="padding: 0cm 3.75pt 0cm 3.75pt">
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            <h1 style="margin: 0cm; mso-line-height-alt: 9.0pt; text-transform: capitalize"><span style="font-size: 10.5pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: .15pt; mso-fareast-language: EN-US">Confirmed Items</span><!-- o ignored --></h1>
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse; box-sizing: content-box; min-width: 100%">
                            <tbody>
                            <tr>
                            <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            <h2 style="margin-top: 0cm; mso-line-height-alt: 9.75pt"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: .15pt; mso-fareast-language: EN-US">&nbsp;</span><span style="mso-fareast-language: EN-US"><!-- o ignored --></span></h2>
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; background: white; border-collapse: collapse; box-sizing: content-box; min-width: 600px">
                            <tbody>
                            <tr>
                            <td width="80" style="width: 60.0pt; padding: 7.5pt 6.0pt 7.5pt 6.0pt"></td>
                            <td valign="top" style="padding: 7.5pt 6.0pt 7.5pt 11.25pt">
                            <div align="right">
                            <table class="v1MsoNormalTable" dir="rtl" border="0" cellspacing="0" cellpadding="0" width="591" style="width: 443.35pt; border-collapse: collapse; box-sizing: content-box">
                            <tbody>
                            ${
															result2
																? result2.items.map((item: any, index: any) => {
																		return `
                                <tr style="height: 14.8pt">
                                    <td valign="top" style="padding: .75pt .75pt .75pt .75pt; height: 14.8pt">
                                        <p class="v1MsoNormal" align="right" dir="LTR" style="text-align: right; line-height: 12.0pt; font-size: 12pt">
                                        <b><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${dto.paymentsDetails.currency}${item.itemPrice}</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                                    </td>
                                    <td valign="top" style="padding: .75pt .75pt .75pt 0cm; height: 14.8pt">
                                        <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #505E83; mso-fareast-language: EN-US">Brand : ${item.itemBrand.name}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                        <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #505E83; mso-fareast-language: EN-US">Category : ${item.itemCategory.name}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                        
                                        <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Item : ${item.itemName}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                        <p dir="LTR" style="margin: 0cm; line-height: 12.0pt"><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Quantity :
                                        </span><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">${item.quantity}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                        <p dir="LTR" style="margin: 0cm; font-size: 12.0pt; line-height: 9.0pt"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #84FB51; mso-fareast-language: EN-US">Receive it
                                        </span></b><b><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #84FB51; mso-fareast-language: EN-US">in ${adminData[0].est_delivery} days</span></b><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #84FB51; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                    </td>
                                </tr>
                                `;
																  })
																: ''
														}
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            <p class="v1MsoNormal" style="line-height: 12.0pt"><span style="font-size: 11.0pt; font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse; box-sizing: content-box; min-width: 100%">
                            <tbody>
                            <tr>
                            <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 3.75pt 3.75pt 3.75pt 3.75pt">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="border-collapse: collapse; box-sizing: content-box">
                            <tbody>
                            <tr>
                            <td style="padding: 10.5pt 12.0pt 7.5pt 15.0pt">
                            <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Subtotal</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 10.5pt 15.0pt 7.5pt 15.0pt">
                            <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; font-size:12pt">
                            <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															dto.paymentsDetails.currency
														}${
									dto.paymentsDetails.sub_total
								}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr style="height: 4.0pt">
                            <td style="padding: 15.0pt 12.0pt 7.5pt 15.0pt; height: 4.0pt">
                            <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Shipping Fee</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt; height: 4.0pt">
                            <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; font-size:12pt">
                            <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															dto.paymentsDetails.currency
														}${
									dto.paymentsDetails.shippingCharges
								}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr style="height: 10.85pt">
                            <td style="padding: 15.0pt 12.0pt 7.5pt 15.0pt; height: 10.85pt">
                            <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt; font-size:12pt"><span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Tax Fee</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt; height: 10.85pt">
                            <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; ; font-size:12pt">
                            <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															dto.paymentsDetails.currency
														}${
									dto.paymentsDetails.taxAmount
								}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td valign="bottom" style="padding: 9.75pt 12.0pt 7.5pt 15.0pt">
                            <p class="v1MsoNormal" style="line-height: 12.0pt; font-size:12pt"><b><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Total<span class="v1apple-converted-space">&nbsp;</span></span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 9.75pt 15.0pt 7.5pt 15.0pt">
                            <p class="v1MsoNormal" align="right" style="text-align: right; line-height: 12.0pt"><b><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															dto.paymentsDetails.currency
														}${
									dto.paymentsDetails.totalCharges
								}</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt"></td>
                            <td style="padding: 15.0pt 15.0pt 15.0pt 15.0pt"></td>
                            </tr>
                            </tbody>
                            </table>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse; box-sizing: content-box">
                            <tbody>
                            <tr>
                            <td style="padding: 15.0pt 3.75pt 0cm 3.75pt">
                            <p style="margin: 0cm"><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">We'll let you know when your order is on its way to you so you can really get excited about it.<span class="v1apple-converted-space">&nbsp;</span></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            <p class="v1MsoNormal" style="line-height: 12.0pt"><span style="font-size: 11.0pt; font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <p style="margin: 0cm"><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">We're doing everything we can to ensure you get your order safely by:<span class="v1apple-converted-space">&nbsp;</span></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            <ol start="1" type="1">
                            <li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                            <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Sanitizing our facilities</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li><li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                            <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Monitoring hygiene</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li><li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                            <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Providing contactless payment options</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li></ol>
                            <p style="margin: 0cm"><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Until then, stay safe at home while we deliver to you.<span class="v1apple-converted-space">&nbsp;</span></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 13.5pt 3.75pt 0cm 3.75pt">
                            <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">Thanks</span></b><b><span style="font-size: 10.5pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">,<br>
                            The </span></b><b><span lang="EN-US" style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">MBE
                            </span></b><b><span style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">&nbsp;team</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            <p class="v1MsoNormal"><span style="font-size: 12.0pt; mso-fareast-language: EN-US">&nbsp;<!-- o ignored --></span></p>
                            </div>
                            </div>
                            </div>`;

								var mailOptions = {
									// from: 'subodhiat8@gmail.com',
									from: 'Social@multibrandselectronics.com',
									to: userDetails.email,
									subject: 'Order Placed | MBE',
									//text: `Passsword reset link ${variableAndValues[2].value}`,
									html: emalhtml,
								};
								transporter.sendMail(
									mailOptions,
									function (error: any, info: any) {
										if (error) {
											console.log(error);
										} else {
											console.log('Email sent: ' + info.response);
										}
									}
								);
							})();
						}
					});

					// console.log('paymentDetails#######', dto);

					(() => {
						// send  mail to admin
						var transporter = nodemailer.createTransport({
							service: 'gmail',
							port: 465,
							secure: true,
							auth: {
								user: 'Social@multibrandselectronics.com',
								pass: 'navqbqczsyqfpcky',
							},
						});

						let emalhtml = `<!DOCTYPE html>
                        <html>
                        <head>
                            <meta name="viewport" content="width=device-width">
                            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                            <title>Welcome Email Template</title>
                        </head>
                        <body>
                            <p style="font-size: 14px; font-weight: normal;">Hi admin,</p>
                            <p style="font-size: 14px; font-weight: normal;">There is a new order placed on ${moment
															.utc(result2.added.at)
															.format('MM-DD-YY hh:mm A')} by ${
							userDetails.email
						}.</p>
                            <p style="font-size: 14px; font-weight: normal;"><br>
                            ______________________________________<br>
                            Order Id: ${result._id}<br>
                            Shipping Id: ${dto.shippingId}<br>
                            Payment Type: ${dto.paymentType}<br>
                            Tax Amount: ${dto.paymentsDetails.currency}${
							dto.paymentsDetails.taxAmount
						}<br>
                            Shipping Charges: ${dto.paymentsDetails.currency}${
							dto.paymentsDetails.shippingCharges
						}<br>
                            Total Charges:${dto.paymentsDetails.currency}${
							dto.paymentsDetails.totalCharges
						}<br>
                            Order Status: ${dto.orderStatus}<br>
                            ______________________________________<br></p>
                            
                            <p><br><br><br><b>- This is an automated mail, do not reply.</p>
                        </body>
                        </html>`;

						var mailOptions = {
							// from: 'subodhiat8@gmail.com',
							from: 'Social@multibrandselectronics.com',
							to: 'Hussein@multibrandselectronics.com',
							subject: 'New Order Placed | MBE',
							//text: `Passsword reset link ${variableAndValues[2].value}`,
							html: emalhtml,
						};
						transporter.sendMail(mailOptions, function (error: any, info: any) {
							if (error) {
								console.log(error);
							} else {
								console.log('Email sent: ' + info.response);
							}
						});
					})();

					res.json({ success: true, status: 'success', data: result });
					return;
				} else {
					//card payment
					const ress = await this.MakePaymentDetails(
						payId,
						dto.paymentsDetails.totalCharges,
						dto.paymentsDetails.currency,
						'card',
						userDetails.email,
						'',
						userDetails.name
					);
					const currentTime = moment().toISOString();
					dto.orderplaced = {
						// @ts-ignore
						at: currentTime
					}
					const result = await this.orderDAO.create(dto);
					const result2 = await this.cartDAO.getCartByUserId(dto.userId);

					var nodemailer = require('nodemailer');

					axios({
						method: 'post',
						url: 'https://fcm.googleapis.com/fcm/send',
						headers: {
							Authorization:
								'Bearer AAAA960yEqE:APA91bGRnNZXOYM7EJYf-mW45szpTo5A0XoAuIafmgEyDs1P_SNcsKQriM-S1G6cgDoaldVx7VJshStKfvkyiEr2uqUWoznc6FAaCzGUmnpXCP6P-SGtaHG52u28l4hgMt8aCVSmmXol',
							'Content-Type': 'application/json',
						},
						data: {
							to: userDetails.fcmToken,
							notification: {
								body: 'Your order has been placed.',
								title: 'Order Placed',
							},
						},
					}).then((res: any) => {
						if (res) {
							(() => {
								// send confirmation mail to user
								var transporter = nodemailer.createTransport({
									service: 'gmail',
									port: 465,
									secure: true,
									auth: {
										user: 'Social@multibrandselectronics.com',
										pass: 'navqbqczsyqfpcky',
									},
								});

								let emalhtml = `<div class="message-htmlpart" id="message-htmlpart1"><!-- html ignored --><!-- head ignored --><!-- meta ignored -->
        
                            <!-- meta ignored -->
                            <style type="text/css">@font-face
                                { font-family: "Cambria Math"; }
                            @font-face
                                { font-family: Calibri; }
                            @font-face
                                { font-family: "Calibri Light"; }
                            @font-face
                                { font-family: "Proxima Nova"; }
                            
                            #message-htmlpart1 div.rcmBody p.v1MsoNormal, #message-htmlpart1 div.rcmBody li.v1MsoNormal, #message-htmlpart1 div.rcmBody div.v1MsoNormal
                                { margin: 0cm; font-size: 10.0pt; font-family: "Calibri",sans-serif; }
                            #message-htmlpart1 div.rcmBody h1
                                { mso-style-priority: 9; mso-style-link: "Heading 1 Char"; mso-margin-top-alt: auto; margin-right: 0cm; mso-margin-bottom-alt: auto; margin-left: 0cm; font-size: 24.0pt; font-family: "Calibri",sans-serif; font-weight: bold; }
                            #message-htmlpart1 div.rcmBody h2
                                { mso-style-priority: 9; mso-style-link: "Heading 2 Char"; margin-top: 2.0pt; margin-right: 0cm; margin-bottom: 0cm; margin-left: 0cm; page-break-after: avoid; font-size: 13.0pt; font-family: "Calibri Light",sans-serif; color: #2F5496; font-weight: normal; }
                            #message-htmlpart1 div.rcmBody span.v1Heading1Char
                                { mso-style-name: "Heading 1 Char"; mso-style-priority: 9; mso-style-link: "Heading 1"; font-family: "Times New Roman",serif; mso-fareast-language: EN-GB; font-weight: bold; }
                            #message-htmlpart1 div.rcmBody span.v1Heading2Char
                                { mso-style-name: "Heading 2 Char"; mso-style-priority: 9; mso-style-link: "Heading 2"; font-family: "Calibri Light",sans-serif; color: #2F5496; }
                            #message-htmlpart1 div.rcmBody span.v1apple-converted-space
                                { mso-style-name: apple-converted-space; }
                            #message-htmlpart1 div.rcmBody .v1MsoChpDefault
                                { mso-style-type: export-only; font-size: 10.0pt; }
                            @page WordSection1
                                { size: 612.0pt 792.0pt; margin: 72.0pt 72.0pt 72.0pt 72.0pt; }
                            #message-htmlpart1 div.rcmBody div.v1WordSection1
                                { }
                            
                            @list l0
                                { mso-list-id: 384643365; mso-list-template-ids: 860935196; }
                            @list l0:level1
                                { mso-level-tab-stop: 36.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level2
                                { mso-level-tab-stop: 72.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level3
                                { mso-level-tab-stop: 108.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level4
                                { mso-level-tab-stop: 144.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level5
                                { mso-level-tab-stop: 180.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level6
                                { mso-level-tab-stop: 216.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level7
                                { mso-level-tab-stop: 252.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level8
                                { mso-level-tab-stop: 288.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level9
                                { mso-level-tab-stop: 324.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l1
                                { mso-list-id: 1553690363; mso-list-template-ids: -736616126; }
                            #message-htmlpart1 div.rcmBody ol
                                { margin-bottom: 0cm; }
                            #message-htmlpart1 div.rcmBody ul
                                { margin-bottom: 0cm; }</style>
                            
                            <div class="rcmBody" lang="en-SE" link="#0563C1" vlink="#954F72" style="word-wrap: break-word">
                            <div class="v1WordSection1">
                            <p class="v1MsoNormal"><span style="font-size: 14.0pt; mso-fareast-language: EN-US">&nbsp;<!-- o ignored --></span></p>
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="800" style="width: 600.0pt; background: white; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="padding: 15.0pt 0cm 15.0pt 0cm">
                            <div align="center">
                            <table class="v1MsoNormalTable" dir="rtl" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; background: white; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td width="60%" style="width: 60.0%; padding: 0cm 0cm 0cm 0cm">
                            <p class="v1MsoNormal" dir="LTR" style="mso-margin-top-alt: 8.25pt; margin-right: 0cm; margin-bottom: 8.25pt; margin-left: 0cm; line-height: 26.65pt">
                            <b><span style="font-size: 24.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; letter-spacing: -.3pt">
                            You're all sorted.&nbsp;</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <p class="v1MsoNormal" dir="LTR" style="line-height: 3.0pt; background: #FFF895; vertical-align: top">
                            <span style="font-size: 3.0pt; font-family: &quot;Proxima Nova&quot;; color: black">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            <p class="v1MsoNormal"><span style="font-size: 11.0pt">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="800" style="width: 600.0pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="padding: 3.75pt 3.75pt 3.75pt 3.75pt">
                            <p class="v1MsoNormal"><b><span lang="EN-US" style="font-size: 13.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: -.1pt">Hello ${
															userDetails.name
														}</span></b><b><span style="font-size: 13.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: -.1pt">&nbsp;</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 3.75pt 3.75pt 3.75pt 3.75pt">
                            <p class="v1MsoNormal"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F; font-size:12pt">You've got great taste! We're so glad you chose
                            </span><span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F">MBE</span><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F">.&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 6.75pt 3.75pt 6.75pt 3.75pt">
                            <p class="v1MsoNormal" style="font-size:12pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F;">Your order
                            </span><span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F">(id: ${
															result._id
														})
                            </span><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F">has been received and is currently being processed by our crew.</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <p class="v1MsoNormal"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td width="50%" valign="top" style="width: 50.0%; background: white; padding: 0cm 0cm 0cm 0cm">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="background: white; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td colspan="2" style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                            <p style="margin: 0cm"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; text-transform: uppercase; letter-spacing: .15pt; mso-fareast-language: EN-US">ORDER SUMMARY</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                            <p style="margin: 0cm; min-width: 55px; font-size:10pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Order No:</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                            <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															result._id
														}</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                            <p style="margin: 0cm; min-width: 55px"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Order Total:</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                            <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															dto.paymentsDetails.currency
														}${
									dto.paymentsDetails.totalCharges
								}</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td valign="top" style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                            <p style="margin: 0cm; min-width: 55px"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Payment :</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                            <p style="margin: 0cm"><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif; color: black; mso-fareast-language: EN-US">${
															dto.paymentType
														}</span><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" width="305" style="width: 228.75pt; background: white; border-collapse: collapse; margin-bottom: -.75pt">
                            <tbody>
                            <tr>
                            <td style="padding: 0cm 15.0pt 4.5pt 15.0pt"></td>
                            </tr>
                            </tbody>
                            </table>
                            </td>
                            <td width="50%" valign="top" style="width: 50.0%; background: white; padding: 0cm 0cm 0cm 0cm">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="background: white; border-collapse: collapse; box-sizing: border-box">
                            <tbody>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                            <p style="margin: 0cm"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; text-transform: uppercase; letter-spacing: .15pt; mso-fareast-language: EN-US">SHIPPING ADDRESS<span class="v1apple-converted-space">&nbsp;</span></span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                            <p style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Times New Roman&quot;,serif; color: black; mso-fareast-language: EN-US">Customer name : ${
															userDetails.name
														}</span><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                            <p style="margin: 0cm"><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">
                                name: ${userAddress.name},<br/>
                                addressLine1: ${userAddress.addressLine1},<br/>
                                addressLine2: ${userAddress.addressLine2},<br/>
                                city: ${userAddress.city},<br/>
                                state: ${userAddress.state},<br/>
                                postalCode: ${userAddress.postalCode},<br/>
                                country: ${userAddress.country},<br/>
                                addressType: ${userAddress.addressType},<br/>
                                mobile: ${userAddress.mobile}.
                            </span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="padding: 0cm 3.75pt 0cm 3.75pt">
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            <h1 style="margin: 0cm; mso-line-height-alt: 9.0pt; text-transform: capitalize"><span style="font-size: 10.5pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: .15pt; mso-fareast-language: EN-US">Confirmed Items</span><!-- o ignored --></h1>
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse; box-sizing: content-box; min-width: 100%">
                            <tbody>
                            <tr>
                            <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            <h2 style="margin-top: 0cm; mso-line-height-alt: 9.75pt"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: .15pt; mso-fareast-language: EN-US">&nbsp;</span><span style="mso-fareast-language: EN-US"><!-- o ignored --></span></h2>
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; background: white; border-collapse: collapse; box-sizing: content-box; min-width: 600px">
                            <tbody>
                            <tr>
                            <td width="80" style="width: 60.0pt; padding: 7.5pt 6.0pt 7.5pt 6.0pt"></td>
                            <td valign="top" style="padding: 7.5pt 6.0pt 7.5pt 11.25pt">
                            <div align="right">
                            <table class="v1MsoNormalTable" dir="rtl" border="0" cellspacing="0" cellpadding="0" width="591" style="width: 443.35pt; border-collapse: collapse; box-sizing: content-box">
                            <tbody>
                            ${
															result2
																? result2.items.map((item: any, index: any) => {
																		return `
                                <tr style="height: 14.8pt">
                                    <td valign="top" style="padding: .75pt .75pt .75pt .75pt; height: 14.8pt">
                                        <p class="v1MsoNormal" align="right" dir="LTR" style="text-align: right; line-height: 12.0pt; font-size: 12pt">
                                        <b><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${dto.paymentsDetails.currency}${item.itemPrice}</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                                    </td>
                                    <td valign="top" style="padding: .75pt .75pt .75pt 0cm; height: 14.8pt">
                                        <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #505E83; mso-fareast-language: EN-US">Brand : ${item.itemBrand.name}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                        <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #505E83; mso-fareast-language: EN-US">Category : ${item.itemCategory.name}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                        <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Item : ${item.itemName}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                        <p dir="LTR" style="margin: 0cm; line-height: 12.0pt"><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Quantity :
                                        </span><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">${item.quantity}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                        <p dir="LTR" style="margin: 0cm; font-size: 12.0pt; line-height: 9.0pt"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #84FB51; mso-fareast-language: EN-US">Receive it
                                        </span></b><b><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #84FB51; mso-fareast-language: EN-US">in ${adminData[0].est_delivery} days</span></b><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #84FB51; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                    </td>
                                </tr>
                                `;
																  })
																: ''
														}
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            <p class="v1MsoNormal" style="line-height: 12.0pt"><span style="font-size: 11.0pt; font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse; box-sizing: content-box; min-width: 100%">
                            <tbody>
                            <tr>
                            <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 3.75pt 3.75pt 3.75pt 3.75pt">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="border-collapse: collapse; box-sizing: content-box">
                            <tbody>
                            <tr>
                            <td style="padding: 10.5pt 12.0pt 7.5pt 15.0pt">
                            <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Subtotal</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 10.5pt 15.0pt 7.5pt 15.0pt">
                            <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; font-size:12pt">
                            <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															dto.paymentsDetails.currency
														}${
									dto.paymentsDetails.sub_total
								}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr style="height: 4.0pt">
                            <td style="padding: 15.0pt 12.0pt 7.5pt 15.0pt; height: 4.0pt">
                            <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Shipping Fee</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt; height: 4.0pt">
                            <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; font-size:12pt">
                            <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															dto.paymentsDetails.currency
														}${
									dto.paymentsDetails.shippingCharges
								}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr style="height: 10.85pt">
                            <td style="padding: 15.0pt 12.0pt 7.5pt 15.0pt; height: 10.85pt">
                            <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt; font-size:12pt"><span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Tax Fee</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt; height: 10.85pt">
                            <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; ; font-size:12pt">
                            <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															dto.paymentsDetails.currency
														}${
									dto.paymentsDetails.taxAmount
								}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td valign="bottom" style="padding: 9.75pt 12.0pt 7.5pt 15.0pt">
                            <p class="v1MsoNormal" style="line-height: 12.0pt; font-size:12pt"><b><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Total<span class="v1apple-converted-space">&nbsp;</span></span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 9.75pt 15.0pt 7.5pt 15.0pt">
                            <p class="v1MsoNormal" align="right" style="text-align: right; line-height: 12.0pt"><b><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															dto.paymentsDetails.currency
														}${
									dto.paymentsDetails.totalCharges
								}</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt"></td>
                            <td style="padding: 15.0pt 15.0pt 15.0pt 15.0pt"></td>
                            </tr>
                            </tbody>
                            </table>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse; box-sizing: content-box">
                            <tbody>
                            <tr>
                            <td style="padding: 15.0pt 3.75pt 0cm 3.75pt">
                            <p style="margin: 0cm"><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">We'll let you know when your order is on its way to you so you can really get excited about it.<span class="v1apple-converted-space">&nbsp;</span></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            <p class="v1MsoNormal" style="line-height: 12.0pt"><span style="font-size: 11.0pt; font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <p style="margin: 0cm"><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">We're doing everything we can to ensure you get your order safely by:<span class="v1apple-converted-space">&nbsp;</span></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            <ol start="1" type="1">
                            <li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                            <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Sanitizing our facilities</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li><li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                            <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Monitoring hygiene</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li><li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                            <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Providing contactless payment options</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li></ol>
                            <p style="margin: 0cm"><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Until then, stay safe at home while we deliver to you.<span class="v1apple-converted-space">&nbsp;</span></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 13.5pt 3.75pt 0cm 3.75pt">
                            <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">Thanks</span></b><b><span style="font-size: 10.5pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">,<br>
                            The </span></b><b><span lang="EN-US" style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">MBE
                            </span></b><b><span style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">&nbsp;team</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            <p class="v1MsoNormal"><span style="font-size: 12.0pt; mso-fareast-language: EN-US">&nbsp;<!-- o ignored --></span></p>
                            </div>
                            </div>
                            </div>`;

								var mailOptions = {
									from: 'Social@multibrandselectronics.com',
									to: userDetails.email,
									subject: 'Order Placed | MBE',
									html: emalhtml,
								};
								transporter.sendMail(
									mailOptions,
									function (error: any, info: any) {
										if (error) {
											console.log(error);
										} else {
											console.log('Email sent: ' + info.response);
										}
									}
								);
							})();
						}
					});

					(() => {
						// send  mail to admin
						var transporter = nodemailer.createTransport({
							service: 'gmail',
							port: 465,
							secure: true,
							auth: {
								user: 'Social@multibrandselectronics.com',
								pass: 'navqbqczsyqfpcky',
							},
						});

						let emalhtml = `<!DOCTYPE html>
                        <html>
                        <head>
                            <meta name="viewport" content="width=device-width">
                            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                            <title>Welcome Email Template</title>
                        </head>
                        <body>
                            <p style="font-size: 14px; font-weight: normal;">Hi admin,</p>
                            <p style="font-size: 14px; font-weight: normal;">There is a new order placed on ${moment
															.utc(result2.added.at)
															.format('MM-DD-YY hh:mm A')} by ${
							userDetails.email
						}.</p>
                            <p style="font-size: 14px; font-weight: normal;"><br>
                            ______________________________________<br>
                            Order Id: ${result._id}<br>
                            Shipping Id: ${dto.shippingId}<br>
                            Payment Type: ${dto.paymentType}<br>
                            Tax Amount: ${dto.paymentsDetails.currency}${
							dto.paymentsDetails.taxAmount
						}<br>
                            Shipping Charges: ${dto.paymentsDetails.currency}${
							dto.paymentsDetails.shippingCharges
						}<br>
                            Total Charges:${dto.paymentsDetails.currency}${
							dto.paymentsDetails.totalCharges
						}<br>
                            Order Status: ${dto.orderStatus}<br>
                            ______________________________________<br></p>
                            
                            <p><br><br><br><b>- This is an automated mail, do not reply.</p>
                        </body>
                        </html>`;

						var mailOptions = {
							from: 'Social@multibrandselectronics.com',
							to: 'Hussein@multibrandselectronics.com',
							subject: 'New Order Placed | MBE',
							html: emalhtml,
						};
						transporter.sendMail(mailOptions, function (error: any, info: any) {
							if (error) {
								console.log(error);
							} else {
								console.log('Email sent: ' + info.response);
							}
						});
					})();
					ress.all_data = dto;
					// console.log('ress######',ress);
					res.json({ success: true, status: 'success', data: ress });
				}
			}
		} catch (err) {
			catchError(err, next);
		}
	};

	public addNewCardOrders = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		const dto: OrdersDTO = req.body;

		try {
			dto.isPaid = true;
			const currentTime = moment().toISOString();
			dto.orderplaced = {
				// @ts-ignore
				at: currentTime
			}
			const result = await this.orderDAO.create(dto);
			const result2 = await this.cartDAO.getCartByUserId(dto.userId);
			//const result3 = await this.cartDAO.delete(result2._id);
			const userDetails = await this.userDAO.getById(dto.userId);
			const userAddress = await this.addressDAO.getById(dto.shippingId);
			const result45 = this.cartDAO.update_is_ordered(result2._id, 'Yes');
			// ress.order_id = result2._id;

			const filter: any = {};
			filter.$or = [{ status: 'Active' }, { status: 'Not Active' }];
			const adminData = await this.adminsettingsDAO.getByFilter1(filter);

			this.SendNotificationWS('order', 'New', 'neworder', dto.userId);
			var nodemailer = require('nodemailer');

			axios({
				method: 'post',
				url: 'https://fcm.googleapis.com/fcm/send',
				headers: {
					Authorization:
						'Bearer AAAA960yEqE:APA91bGRnNZXOYM7EJYf-mW45szpTo5A0XoAuIafmgEyDs1P_SNcsKQriM-S1G6cgDoaldVx7VJshStKfvkyiEr2uqUWoznc6FAaCzGUmnpXCP6P-SGtaHG52u28l4hgMt8aCVSmmXol',
					'Content-Type': 'application/json',
				},
				data: {
					to: userDetails.fcmToken,
					notification: {
						body: 'Your order has been placed.',
						title: 'Order Placed',
					},
				},
			}).then((res: any) => {
				if (res) {
					(() => {
						// send confirmation mail to user
						var transporter = nodemailer.createTransport({
							service: 'gmail',
							port: 465,
							secure: true,
							auth: {
								user: 'Social@multibrandselectronics.com',
								pass: 'navqbqczsyqfpcky',
							},
						});

						let emalhtml = `<div class="message-htmlpart" id="message-htmlpart1"><!-- html ignored --><!-- head ignored --><!-- meta ignored -->
        
                        <!-- meta ignored -->
                        <style type="text/css">@font-face
                            { font-family: "Cambria Math"; }
                        @font-face
                            { font-family: Calibri; }
                        @font-face
                            { font-family: "Calibri Light"; }
                        @font-face
                            { font-family: "Proxima Nova"; }
                        
                        #message-htmlpart1 div.rcmBody p.v1MsoNormal, #message-htmlpart1 div.rcmBody li.v1MsoNormal, #message-htmlpart1 div.rcmBody div.v1MsoNormal
                            { margin: 0cm; font-size: 10.0pt; font-family: "Calibri",sans-serif; }
                        #message-htmlpart1 div.rcmBody h1
                            { mso-style-priority: 9; mso-style-link: "Heading 1 Char"; mso-margin-top-alt: auto; margin-right: 0cm; mso-margin-bottom-alt: auto; margin-left: 0cm; font-size: 24.0pt; font-family: "Calibri",sans-serif; font-weight: bold; }
                        #message-htmlpart1 div.rcmBody h2
                            { mso-style-priority: 9; mso-style-link: "Heading 2 Char"; margin-top: 2.0pt; margin-right: 0cm; margin-bottom: 0cm; margin-left: 0cm; page-break-after: avoid; font-size: 13.0pt; font-family: "Calibri Light",sans-serif; color: #2F5496; font-weight: normal; }
                        #message-htmlpart1 div.rcmBody span.v1Heading1Char
                            { mso-style-name: "Heading 1 Char"; mso-style-priority: 9; mso-style-link: "Heading 1"; font-family: "Times New Roman",serif; mso-fareast-language: EN-GB; font-weight: bold; }
                        #message-htmlpart1 div.rcmBody span.v1Heading2Char
                            { mso-style-name: "Heading 2 Char"; mso-style-priority: 9; mso-style-link: "Heading 2"; font-family: "Calibri Light",sans-serif; color: #2F5496; }
                        #message-htmlpart1 div.rcmBody span.v1apple-converted-space
                            { mso-style-name: apple-converted-space; }
                        #message-htmlpart1 div.rcmBody .v1MsoChpDefault
                            { mso-style-type: export-only; font-size: 10.0pt; }
                        @page WordSection1
                            { size: 612.0pt 792.0pt; margin: 72.0pt 72.0pt 72.0pt 72.0pt; }
                        #message-htmlpart1 div.rcmBody div.v1WordSection1
                            { }
                        
                        @list l0
                            { mso-list-id: 384643365; mso-list-template-ids: 860935196; }
                        @list l0:level1
                            { mso-level-tab-stop: 36.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level2
                            { mso-level-tab-stop: 72.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level3
                            { mso-level-tab-stop: 108.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level4
                            { mso-level-tab-stop: 144.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level5
                            { mso-level-tab-stop: 180.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level6
                            { mso-level-tab-stop: 216.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level7
                            { mso-level-tab-stop: 252.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level8
                            { mso-level-tab-stop: 288.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level9
                            { mso-level-tab-stop: 324.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l1
                            { mso-list-id: 1553690363; mso-list-template-ids: -736616126; }
                        #message-htmlpart1 div.rcmBody ol
                            { margin-bottom: 0cm; }
                        #message-htmlpart1 div.rcmBody ul
                            { margin-bottom: 0cm; }</style>
                        
                        <div class="rcmBody" lang="en-SE" link="#0563C1" vlink="#954F72" style="word-wrap: break-word">
                        <div class="v1WordSection1">
                        <p class="v1MsoNormal"><span style="font-size: 14.0pt; mso-fareast-language: EN-US">&nbsp;<!-- o ignored --></span></p>
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="800" style="width: 600.0pt; background: white; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td style="padding: 15.0pt 0cm 15.0pt 0cm">
                        <div align="center">
                        <table class="v1MsoNormalTable" dir="rtl" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; background: white; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td width="60%" style="width: 60.0%; padding: 0cm 0cm 0cm 0cm">
                        <p class="v1MsoNormal" dir="LTR" style="mso-margin-top-alt: 8.25pt; margin-right: 0cm; margin-bottom: 8.25pt; margin-left: 0cm; line-height: 26.65pt">
                        <b><span style="font-size: 24.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; letter-spacing: -.3pt">
                        You're all sorted.&nbsp;</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        <p class="v1MsoNormal" dir="LTR" style="line-height: 3.0pt; background: #FFF895; vertical-align: top">
                        <span style="font-size: 3.0pt; font-family: &quot;Proxima Nova&quot;; color: black">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        <p class="v1MsoNormal"><span style="font-size: 11.0pt">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="800" style="width: 600.0pt; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td style="padding: 3.75pt 3.75pt 3.75pt 3.75pt">
                        <p class="v1MsoNormal"><b><span lang="EN-US" style="font-size: 13.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: -.1pt">Hello ${
													userDetails.name
												}</span></b><b><span style="font-size: 13.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: -.1pt">&nbsp;</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 3.75pt 3.75pt 3.75pt 3.75pt">
                        <p class="v1MsoNormal"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F; font-size:12pt">You've got great taste! We're so glad you chose
                        </span><span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F">MBE</span><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F">.&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 6.75pt 3.75pt 6.75pt 3.75pt">
                        <p class="v1MsoNormal" style="font-size:12pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F;">Your order
                        </span><span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F">(id: ${
													result._id
												})
                        </span><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F">has been received and is currently being processed by our crew.</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        <p class="v1MsoNormal"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td width="50%" valign="top" style="width: 50.0%; background: white; padding: 0cm 0cm 0cm 0cm">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="background: white; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td colspan="2" style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                        <p style="margin: 0cm"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; text-transform: uppercase; letter-spacing: .15pt; mso-fareast-language: EN-US">ORDER SUMMARY</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                        <p style="margin: 0cm; min-width: 55px; font-size:10pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Order No:</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                        <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
													result._id
												}</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                        <p style="margin: 0cm; min-width: 55px"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Order Total:</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                        <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
													dto.paymentsDetails.currency
												}${
							dto.paymentsDetails.totalCharges
						}</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td valign="top" style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                        <p style="margin: 0cm; min-width: 55px"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Payment :</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                        <p style="margin: 0cm"><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif; color: black; mso-fareast-language: EN-US">${
													dto.paymentType
												}</span><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" width="305" style="width: 228.75pt; background: white; border-collapse: collapse; margin-bottom: -.75pt">
                        <tbody>
                        <tr>
                        <td style="padding: 0cm 15.0pt 4.5pt 15.0pt"></td>
                        </tr>
                        </tbody>
                        </table>
                        </td>
                        <td width="50%" valign="top" style="width: 50.0%; background: white; padding: 0cm 0cm 0cm 0cm">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="background: white; border-collapse: collapse; box-sizing: border-box">
                        <tbody>
                        <tr>
                        <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                        <p style="margin: 0cm"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; text-transform: uppercase; letter-spacing: .15pt; mso-fareast-language: EN-US">SHIPPING ADDRESS<span class="v1apple-converted-space">&nbsp;</span></span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                        <p style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Times New Roman&quot;,serif; color: black; mso-fareast-language: EN-US">Customer name : ${
													userDetails.name
												}</span><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                        <p style="margin: 0cm"><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">
                            name: ${userAddress.name},<br/>
                            addressLine1: ${userAddress.addressLine1},<br/>
                            addressLine2: ${userAddress.addressLine2},<br/>
                            city: ${userAddress.city},<br/>
                            state: ${userAddress.state},<br/>
                            postalCode: ${userAddress.postalCode},<br/>
                            country: ${userAddress.country},<br/>
                            addressType: ${userAddress.addressType},<br/>
                            mobile: ${userAddress.mobile}.
                        </span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td style="padding: 0cm 3.75pt 0cm 3.75pt">
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        <h1 style="margin: 0cm; mso-line-height-alt: 9.0pt; text-transform: capitalize"><span style="font-size: 10.5pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: .15pt; mso-fareast-language: EN-US">Confirmed Items</span><!-- o ignored --></h1>
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse; box-sizing: content-box; min-width: 100%">
                        <tbody>
                        <tr>
                        <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        <h2 style="margin-top: 0cm; mso-line-height-alt: 9.75pt"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: .15pt; mso-fareast-language: EN-US">&nbsp;</span><span style="mso-fareast-language: EN-US"><!-- o ignored --></span></h2>
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; background: white; border-collapse: collapse; box-sizing: content-box; min-width: 600px">
                        <tbody>
                        <tr>
                        <td width="80" style="width: 60.0pt; padding: 7.5pt 6.0pt 7.5pt 6.0pt"></td>
                        <td valign="top" style="padding: 7.5pt 6.0pt 7.5pt 11.25pt">
                        <div align="right">
                        <table class="v1MsoNormalTable" dir="rtl" border="0" cellspacing="0" cellpadding="0" width="591" style="width: 443.35pt; border-collapse: collapse; box-sizing: content-box">
                        <tbody>
                        ${
													result2
														? result2.items.map((item: any, index: any) => {
																return `
                            <tr style="height: 14.8pt">
                                <td valign="top" style="padding: .75pt .75pt .75pt .75pt; height: 14.8pt">
                                    <p class="v1MsoNormal" align="right" dir="LTR" style="text-align: right; line-height: 12.0pt; font-size: 12pt">
                                    <b><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${dto.paymentsDetails.currency}${item.itemPrice}</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                                </td>
                                <td valign="top" style="padding: .75pt .75pt .75pt 0cm; height: 14.8pt">
                                    <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #505E83; mso-fareast-language: EN-US">Brand : ${item.itemBrand.name}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                    <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #505E83; mso-fareast-language: EN-US">Category : ${item.itemCategory.name}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                    <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Item : ${item.itemName}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                    <p dir="LTR" style="margin: 0cm; line-height: 12.0pt"><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Quantity :
                                    </span><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">${item.quantity}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                    <p dir="LTR" style="margin: 0cm; font-size: 12.0pt; line-height: 9.0pt"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #84FB51; mso-fareast-language: EN-US">Receive it
                                    </span></b><b><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #84FB51; mso-fareast-language: EN-US">in ${adminData[0].est_delivery} days</span></b><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #84FB51; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                </td>
                            </tr>
                            `;
														  })
														: ''
												}
                        </tbody>
                        </table>
                        </div>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        <p class="v1MsoNormal" style="line-height: 12.0pt"><span style="font-size: 11.0pt; font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse; box-sizing: content-box; min-width: 100%">
                        <tbody>
                        <tr>
                        <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 3.75pt 3.75pt 3.75pt 3.75pt">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="border-collapse: collapse; box-sizing: content-box">
                        <tbody>
                        <tr>
                        <td style="padding: 10.5pt 12.0pt 7.5pt 15.0pt">
                        <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Subtotal</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 10.5pt 15.0pt 7.5pt 15.0pt">
                        <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; font-size:12pt">
                        <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
													dto.paymentsDetails.currency
												}${
							dto.paymentsDetails.sub_total
						}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr style="height: 4.0pt">
                        <td style="padding: 15.0pt 12.0pt 7.5pt 15.0pt; height: 4.0pt">
                        <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Shipping Fee</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt; height: 4.0pt">
                        <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; font-size:12pt">
                        <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
													dto.paymentsDetails.currency
												}${
							dto.paymentsDetails.shippingCharges
						}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr style="height: 10.85pt">
                        <td style="padding: 15.0pt 12.0pt 7.5pt 15.0pt; height: 10.85pt">
                        <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt; font-size:12pt"><span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Tax Fee</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt; height: 10.85pt">
                        <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; ; font-size:12pt">
                        <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
													dto.paymentsDetails.currency
												}${
							dto.paymentsDetails.taxAmount
						}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td valign="bottom" style="padding: 9.75pt 12.0pt 7.5pt 15.0pt">
                        <p class="v1MsoNormal" style="line-height: 12.0pt; font-size:12pt"><b><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Total<span class="v1apple-converted-space">&nbsp;</span></span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 9.75pt 15.0pt 7.5pt 15.0pt">
                        <p class="v1MsoNormal" align="right" style="text-align: right; line-height: 12.0pt"><b><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
													dto.paymentsDetails.currency
												}${
							dto.paymentsDetails.totalCharges
						}</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt"></td>
                        <td style="padding: 15.0pt 15.0pt 15.0pt 15.0pt"></td>
                        </tr>
                        </tbody>
                        </table>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse; box-sizing: content-box">
                        <tbody>
                        <tr>
                        <td style="padding: 15.0pt 3.75pt 0cm 3.75pt">
                        <p style="margin: 0cm"><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">We'll let you know when your order is on its way to you so you can really get excited about it.<span class="v1apple-converted-space">&nbsp;</span></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        <p class="v1MsoNormal" style="line-height: 12.0pt"><span style="font-size: 11.0pt; font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        <p style="margin: 0cm"><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">We're doing everything we can to ensure you get your order safely by:<span class="v1apple-converted-space">&nbsp;</span></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        <ol start="1" type="1">
                        <li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                        <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Sanitizing our facilities</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li><li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                        <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Monitoring hygiene</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li><li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                        <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Providing contactless payment options</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li></ol>
                        <p style="margin: 0cm"><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Until then, stay safe at home while we deliver to you.<span class="v1apple-converted-space">&nbsp;</span></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 13.5pt 3.75pt 0cm 3.75pt">
                        <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">Thanks</span></b><b><span style="font-size: 10.5pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">,<br>
                        The </span></b><b><span lang="EN-US" style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">MBE
                        </span></b><b><span style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">&nbsp;team</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        <p class="v1MsoNormal"><span style="font-size: 12.0pt; mso-fareast-language: EN-US">&nbsp;<!-- o ignored --></span></p>
                        </div>
                        </div>
                        </div>`;

						var mailOptions = {
							// from: 'subodhiat8@gmail.com',
							from: 'Social@multibrandselectronics.com',
							to: userDetails.email,
							subject: 'Order Placed | MBE',
							//text: `Passsword reset link ${variableAndValues[2].value}`,
							html: emalhtml,
						};
						transporter.sendMail(mailOptions, function (error: any, info: any) {
							if (error) {
								console.log(error);
							} else {
								console.log('Email sent: ' + info.response);
							}
						});
					})();
				}
			});

			(() => {
				// send  mail to admin
				var transporter = nodemailer.createTransport({
					service: 'gmail',
					port: 465,
					secure: true,
					auth: {
						user: 'Social@multibrandselectronics.com',
						pass: 'navqbqczsyqfpcky',
					},
				});

				let emalhtml = `<!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width">
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                        <title>Welcome Email Template</title>
                    </head>
                    <body>
                        <p style="font-size: 14px; font-weight: normal;">Hi admin,</p>
                        <p style="font-size: 14px; font-weight: normal;">There is a new order placed on ${moment
													.utc(result2.added.at)
													.format('MM-DD-YY hh:mm A')} by ${
					userDetails.email
				}.</p>
                        <p style="font-size: 14px; font-weight: normal;"><br>
                        ______________________________________<br>
                        Order Id: ${result._id}<br>
                        Shipping Id: ${dto.shippingId}<br>
                        Payment Type: ${dto.paymentType}<br>
                        Tax Amount: ${dto.paymentsDetails.currency}${
					dto.paymentsDetails.taxAmount
				}<br>
                        Shipping Charges: ${dto.paymentsDetails.currency}${
					dto.paymentsDetails.shippingCharges
				}<br>
                        Total Charges:${dto.paymentsDetails.currency}${
					dto.paymentsDetails.totalCharges
				}<br>
                        Order Status: ${dto.orderStatus}<br>
                        ______________________________________<br></p>
                        
                        <p><br><br><br><b>- This is an automated mail, do not reply.</p>
                    </body>
                    </html>`;

				var mailOptions = {
					// from: 'subodhiat8@gmail.com',
					from: 'Social@multibrandselectronics.com',
					to: 'Hussein@multibrandselectronics.com',
					subject: 'New Order Placed | MBE',
					//text: `Passsword reset link ${variableAndValues[2].value}`,
					html: emalhtml,
				};
				transporter.sendMail(mailOptions, function (error: any, info: any) {
					if (error) {
						console.log(error);
					} else {
						console.log('Email sent: ' + info.response);
					}
				});
			})();

			res.json({
				success: true,
				status: 'success',
				data: { orderId: result2._id },
			});
		} catch (err) {
			catchError(err, next);
		}
	};

	public updateOrders = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const dto: OrdersDTO = req.body;
			var nodemailer = require('nodemailer');
			var transporter = nodemailer.createTransport({
				service: 'gmail',
				port: 465,
				secure: true,
				auth: {
					user: 'Social@multibrandselectronics.com',
					pass: 'navqbqczsyqfpcky',
				},
			});

			const orderDetails = await this.orderDAO.getById(id);

			// console.log('######orderDateils#######',JSON.parse(JSON.stringify(orderDetails)));
			// console.log('######paymentsDetails#######',JSON.parse(JSON.stringify(orderDetails?.paymentsDetails))['sub_total']);

			const userDetails = await this.userDAO.getById(orderDetails.userId);
			const userAddress = await this.addressDAO.getById(
				orderDetails.shippingId
			);
			const filter: any = {};
			filter.$or = [{ status: 'Active' }, { status: 'Not Active' }];
			const adminData = await this.adminsettingsDAO.getByFilter1(filter);
			const result2 = await this.cartDAO.getById(orderDetails.cartId);

			if (dto.cancellationReason) {
				const currentTime = moment().toISOString();
				dto.ordercancelled = {
					// @ts-ignore
					at: currentTime
				}
				const result = this.orderDAO.update(id, dto);

				//const result = this.orderDAO.cancelOrderUpdate(id, dto.cancellationReason);
				if (result) {
					axios({
						method: 'post',
						url: 'https://fcm.googleapis.com/fcm/send',
						headers: {
							Authorization:
								'Bearer AAAA960yEqE:APA91bGRnNZXOYM7EJYf-mW45szpTo5A0XoAuIafmgEyDs1P_SNcsKQriM-S1G6cgDoaldVx7VJshStKfvkyiEr2uqUWoznc6FAaCzGUmnpXCP6P-SGtaHG52u28l4hgMt8aCVSmmXol',
							'Content-Type': 'application/json',
						},
						data: {
							to: userDetails.fcmToken,
							notification: {
								body: 'Your order has been cancelled.',
								title: 'Order Cancelled',
							},
							'gcm.message_id': '123',
						},
					}).then((res: any) => {
						if (res) {
							let emalhtml = `<div class="message-htmlpart" id="message-htmlpart1"><!-- html ignored --><!-- head ignored --><!-- meta ignored -->

                            <!-- meta ignored -->
                            <style type="text/css">@font-face
                                { font-family: "Cambria Math"; }
                            @font-face
                                { font-family: Calibri; }
                            @font-face
                                { font-family: "Calibri Light"; }
                            @font-face
                                { font-family: "Proxima Nova"; }
                            
                            #message-htmlpart1 div.rcmBody p.v1MsoNormal, #message-htmlpart1 div.rcmBody li.v1MsoNormal, #message-htmlpart1 div.rcmBody div.v1MsoNormal
                                { margin: 0cm; font-size: 10.0pt; font-family: "Calibri",sans-serif; }
                            #message-htmlpart1 div.rcmBody h1
                                { mso-style-priority: 9; mso-style-link: "Heading 1 Char"; mso-margin-top-alt: auto; margin-right: 0cm; mso-margin-bottom-alt: auto; margin-left: 0cm; font-size: 24.0pt; font-family: "Calibri",sans-serif; font-weight: bold; }
                            #message-htmlpart1 div.rcmBody h2
                                { mso-style-priority: 9; mso-style-link: "Heading 2 Char"; margin-top: 2.0pt; margin-right: 0cm; margin-bottom: 0cm; margin-left: 0cm; page-break-after: avoid; font-size: 13.0pt; font-family: "Calibri Light",sans-serif; color: #2F5496; font-weight: normal; }
                            #message-htmlpart1 div.rcmBody span.v1Heading1Char
                                { mso-style-name: "Heading 1 Char"; mso-style-priority: 9; mso-style-link: "Heading 1"; font-family: "Times New Roman",serif; mso-fareast-language: EN-GB; font-weight: bold; }
                            #message-htmlpart1 div.rcmBody span.v1Heading2Char
                                { mso-style-name: "Heading 2 Char"; mso-style-priority: 9; mso-style-link: "Heading 2"; font-family: "Calibri Light",sans-serif; color: #2F5496; }
                            #message-htmlpart1 div.rcmBody span.v1apple-converted-space
                                { mso-style-name: apple-converted-space; }
                            #message-htmlpart1 div.rcmBody .v1MsoChpDefault
                                { mso-style-type: export-only; font-size: 10.0pt; }
                            @page WordSection1
                                { size: 612.0pt 792.0pt; margin: 72.0pt 72.0pt 72.0pt 72.0pt; }
                            #message-htmlpart1 div.rcmBody div.v1WordSection1
                                { }
                            
                            @list l0
                                { mso-list-id: 384643365; mso-list-template-ids: 860935196; }
                            @list l0:level1
                                { mso-level-tab-stop: 36.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level2
                                { mso-level-tab-stop: 72.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level3
                                { mso-level-tab-stop: 108.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level4
                                { mso-level-tab-stop: 144.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level5
                                { mso-level-tab-stop: 180.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level6
                                { mso-level-tab-stop: 216.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level7
                                { mso-level-tab-stop: 252.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level8
                                { mso-level-tab-stop: 288.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l0:level9
                                { mso-level-tab-stop: 324.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                            @list l1
                                { mso-list-id: 1553690363; mso-list-template-ids: -736616126; }
                            #message-htmlpart1 div.rcmBody ol
                                { margin-bottom: 0cm; }
                            #message-htmlpart1 div.rcmBody ul
                                { margin-bottom: 0cm; }</style>
                            
                            <div class="rcmBody" lang="en-SE" link="#0563C1" vlink="#954F72" style="word-wrap: break-word">
                            <div class="v1WordSection1">
                            <p class="v1MsoNormal"><span style="font-size: 14.0pt; mso-fareast-language: EN-US">&nbsp;<!-- o ignored --></span></p>
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="800" style="width: 600.0pt; background: white; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="padding: 15.0pt 0cm 15.0pt 0cm">
                            <div align="center">
                            <table class="v1MsoNormalTable" dir="rtl" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; background: white; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td width="60%" style="width: 60.0%; padding: 0cm 0cm 0cm 0cm">
                            <p class="v1MsoNormal" dir="LTR" style="mso-margin-top-alt: 8.25pt; margin-right: 0cm; margin-bottom: 8.25pt; margin-left: 0cm; line-height: 26.65pt">
                            <b><span style="font-size: 24.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; letter-spacing: -.3pt">An item from your order has been cancelled&nbsp;</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <p class="v1MsoNormal" dir="LTR" style="line-height: 3.0pt; background: #FFF895; vertical-align: top">
                            <span style="font-size: 3.0pt; font-family: &quot;Proxima Nova&quot;; color: black">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            <p class="v1MsoNormal"><span style="font-size: 11.0pt">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="800" style="width: 600.0pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="padding: 3.75pt 3.75pt 3.75pt 3.75pt">
                            <p class="v1MsoNormal"><b><span lang="EN-US" style="font-size: 13.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: -.1pt">Hello ${
															userDetails.name
														}</span></b><b><span style="font-size: 13.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: -.1pt">&nbsp;</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 6.75pt 3.75pt 6.75pt 3.75pt">
                            <p class="v1MsoNormal" style="font-size:12pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F;">We are sorry but an item from your order
                            </span><span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F">(id: ${id})
                            </span><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F"> has been cancelled. If you have paid by card your refund will be processed to your account. Depending on the bank, the refund might take 7-14 business days to reflect in your account.</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <p class="v1MsoNormal"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td width="50%" valign="top" style="width: 50.0%; background: white; padding: 0cm 0cm 0cm 0cm">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="background: white; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td colspan="2" style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                            <p style="margin: 0cm"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; text-transform: uppercase; letter-spacing: .15pt; mso-fareast-language: EN-US">ORDER SUMMARY</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                            <p style="margin: 0cm; min-width: 55px; font-size:10pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Order No:</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                            <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${id}</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                            <p style="margin: 0cm; min-width: 55px"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Order Total:</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                            <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															orderDetails?.paymentsDetails?.currency
														}${
								orderDetails.paymentsDetails.totalCharges
							}</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td valign="top" style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                            <p style="margin: 0cm; min-width: 55px"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Payment :</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                            <p style="margin: 0cm"><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif; color: black; mso-fareast-language: EN-US">${
															orderDetails.paymentType
														}</span><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" width="305" style="width: 228.75pt; background: white; border-collapse: collapse; margin-bottom: -.75pt">
                            <tbody>
                            <tr>
                            <td style="padding: 0cm 15.0pt 4.5pt 15.0pt"></td>
                            </tr>
                            </tbody>
                            </table>
                            </td>
                            <td width="50%" valign="top" style="width: 50.0%; background: white; padding: 0cm 0cm 0cm 0cm">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="background: white; border-collapse: collapse; box-sizing: border-box">
                            <tbody>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                            <p style="margin: 0cm"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; text-transform: uppercase; letter-spacing: .15pt; mso-fareast-language: EN-US">SHIPPING ADDRESS<span class="v1apple-converted-space">&nbsp;</span></span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                            <p style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Times New Roman&quot;,serif; color: black; mso-fareast-language: EN-US">Customer name : ${
															userDetails.name
														}</span><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                            <p style="margin: 0cm"><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">
                                name: ${userAddress.name},<br/>
                                addressLine1: ${userAddress.addressLine1},<br/>
                                addressLine2: ${userAddress.addressLine2},<br/>
                                city: ${userAddress.city},<br/>
                                state: ${userAddress.state},<br/>
                                postalCode: ${userAddress.postalCode},<br/>
                                country: ${userAddress.country},<br/>
                                addressType: ${userAddress.addressType},<br/>
                                mobile: ${userAddress.mobile}.
                            </span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="padding: 0cm 3.75pt 0cm 3.75pt">
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse">
                            <tbody>
                            <tr>
                            <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            <h1 style="margin: 0cm; mso-line-height-alt: 9.0pt; text-transform: capitalize"><span style="font-size: 10.5pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: .15pt; mso-fareast-language: EN-US">Confirmed Items</span><!-- o ignored --></h1>
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse; box-sizing: content-box; min-width: 100%">
                            <tbody>
                            <tr>
                            <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            <h2 style="margin-top: 0cm; mso-line-height-alt: 9.75pt"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: .15pt; mso-fareast-language: EN-US">&nbsp;</span><span style="mso-fareast-language: EN-US"><!-- o ignored --></span></h2>
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; background: white; border-collapse: collapse; box-sizing: content-box; min-width: 600px">
                            <tbody>
                            <tr>
                            <td width="80" style="width: 60.0pt; padding: 7.5pt 6.0pt 7.5pt 6.0pt"></td>
                            <td valign="top" style="padding: 7.5pt 6.0pt 7.5pt 11.25pt">
                            <div align="right">
                            <table class="v1MsoNormalTable" dir="rtl" border="0" cellspacing="0" cellpadding="0" width="591" style="width: 443.35pt; border-collapse: collapse; box-sizing: content-box">
                            <tbody>
                            ${
															result2
																? result2.items.map((item: any, index: any) => {
																		return `
                                <tr style="height: 14.8pt">
                                    <td valign="top" style="padding: .75pt .75pt .75pt .75pt; height: 14.8pt">
                                        <p class="v1MsoNormal" align="right" dir="LTR" style="text-align: right; line-height: 12.0pt; font-size: 12pt">
                                        <b><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${orderDetails?.paymentsDetails?.currency}${item.itemPrice}</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                                    </td>
                                    <td valign="top" style="padding: .75pt .75pt .75pt 0cm; height: 14.8pt">
                                        <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #505E83; mso-fareast-language: EN-US">Brand : ${item.itemBrand.name}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                        <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #505E83; mso-fareast-language: EN-US">Category : ${item.itemCategory.name}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                        <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Item : ${item.itemName}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                        <p dir="LTR" style="margin: 0cm; line-height: 12.0pt"><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Quantity :
                                        </span><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">${item.quantity}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                        <p dir="LTR" style="margin: 0cm; font-size: 12.0pt; line-height: 9.0pt"><b><span lang="EN-US" style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: red">Canceled</span></b><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #84FB51; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                    </td>
                                </tr>
                                `;
																  })
																: ''
														}
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            <p class="v1MsoNormal" style="line-height: 12.0pt"><span style="font-size: 11.0pt; font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse; box-sizing: content-box; min-width: 100%">
                            <tbody>
                            <tr>
                            <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 3.75pt 3.75pt 3.75pt 3.75pt">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="border-collapse: collapse; box-sizing: content-box">
                            <tbody>
                            <tr>
                            <td style="padding: 10.5pt 12.0pt 7.5pt 15.0pt">
                            <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Subtotal</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 10.5pt 15.0pt 7.5pt 15.0pt">
                            <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; font-size:12pt">
                            <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															orderDetails?.paymentsDetails?.currency
														}${
								JSON.parse(JSON.stringify(orderDetails?.paymentsDetails))[
									'sub_total'
								]
							}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr style="height: 4.0pt">
                            <td style="padding: 15.0pt 12.0pt 7.5pt 15.0pt; height: 4.0pt">
                            <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Shipping Fee</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt; height: 4.0pt">
                            <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; font-size:12pt">
                            <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															orderDetails?.paymentsDetails?.currency
														}${
								orderDetails.paymentsDetails.shippingCharges
							}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr style="height: 10.85pt">
                            <td style="padding: 15.0pt 12.0pt 7.5pt 15.0pt; height: 10.85pt">
                            <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt; font-size:12pt"><span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Tax Fee</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt; height: 10.85pt">
                            <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; ; font-size:12pt">
                            <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															orderDetails?.paymentsDetails?.currency
														}${
								orderDetails.paymentsDetails.taxAmount
							}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td valign="bottom" style="padding: 9.75pt 12.0pt 7.5pt 15.0pt">
                            <p class="v1MsoNormal" style="line-height: 12.0pt; font-size:12pt"><b><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Total<span class="v1apple-converted-space">&nbsp;</span></span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            <td style="padding: 9.75pt 15.0pt 7.5pt 15.0pt">
                            <p class="v1MsoNormal" align="right" style="text-align: right; line-height: 12.0pt"><b><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
															orderDetails?.paymentsDetails?.currency
														}${
								orderDetails.paymentsDetails.totalCharges
							}</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt"></td>
                            <td style="padding: 15.0pt 15.0pt 15.0pt 15.0pt"></td>
                            </tr>
                            </tbody>
                            </table>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                            <div align="center">
                            <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse; box-sizing: content-box">
                            <tbody>
                            <tr>
                            <td style="padding: 15.0pt 3.75pt 0cm 3.75pt">
                            <p class="v1MsoNormal" style="line-height: 12.0pt"><span style="font-size: 11.0pt; font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                            <p style="margin: 0cm"><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">We're doing everything we can to ensure you get your order safely by:<span class="v1apple-converted-space">&nbsp;</span></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            <ol start="1" type="1">
                            <li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                            <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Sanitizing our facilities</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li><li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                            <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Monitoring hygiene</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li><li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                            <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Providing contactless payment options</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li></ol>
                            <p style="margin: 0cm"><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Until then, stay safe at home while we deliver to you.<span class="v1apple-converted-space">&nbsp;</span></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            <tr>
                            <td style="padding: 13.5pt 3.75pt 0cm 3.75pt">
                            <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">Thanks</span></b><b><span style="font-size: 10.5pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">,<br>
                            The </span></b><b><span lang="EN-US" style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">MBE
                            </span></b><b><span style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">&nbsp;team</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            </div>
                            </td>
                            </tr>
                            </tbody>
                            </table>
                            <p class="v1MsoNormal"><span style="font-size: 12.0pt; mso-fareast-language: EN-US">&nbsp;<!-- o ignored --></span></p>
                            </div>
                            </div>
                            </div>`;
							var mailOptions = {
								// from: 'subodhiat8@gmail.com',
								from: 'Social@multibrandselectronics.com',
								to: userDetails.email,
								subject: 'Order Cancelled | MBE',
								//text: `Passsword reset link ${variableAndValues[2].value}`,
								html: emalhtml,
							};
							transporter.sendMail(
								mailOptions,
								function (error: any, info: any) {
									if (error) {
										console.log(error);
									} else {
										console.log('Email sent: ' + info.response);
									}
								}
							);
						}
					});

					res.json({
						success: true,
						status: 'order cancelled successfully!',
						data: orderDetails,
					});
				} else {
					res.json({ success: false, status: 'Order cancellation failed!' });
				}
			}
			const currentTime = moment().toISOString();
			if (dto.orderStatus === 'Delivered') {
				dto.orderdelivered = {
					// @ts-ignore
					at: currentTime
				}
			}
			if(dto.orderStatus === 'Shipped') {
				dto.ordershipped = {
					// @ts-ignore
					at: currentTime
				}
			}
			const result = this.orderDAO.update(id, dto);

			if (dto.orderStatus == 'Delivered') {
				axios({
					method: 'post',
					url: 'https://fcm.googleapis.com/fcm/send',
					headers: {
						Authorization:
							'Bearer AAAA960yEqE:APA91bGRnNZXOYM7EJYf-mW45szpTo5A0XoAuIafmgEyDs1P_SNcsKQriM-S1G6cgDoaldVx7VJshStKfvkyiEr2uqUWoznc6FAaCzGUmnpXCP6P-SGtaHG52u28l4hgMt8aCVSmmXol',
						'Content-Type': 'application/json',
					},
					data: {
						to: userDetails.fcmToken,
						notification: {
							body: `Your order has been ${dto.orderStatus}.`,
							title: `Order ${dto.orderStatus}`,
						},
					},
				}).then((res: any) => {
					if (res) {
						let emalhtml = `<div class="message-htmlpart" id="message-htmlpart1"><!-- html ignored --><!-- head ignored --><!-- meta ignored -->
                        <!-- meta ignored -->
                        <style type="text/css">@font-face
                            { font-family: "Cambria Math"; }
                        @font-face
                            { font-family: Calibri; }
                        @font-face
                            { font-family: "Calibri Light"; }
                        @font-face
                            { font-family: "Proxima Nova"; }
                        
                        #message-htmlpart1 div.rcmBody p.v1MsoNormal, #message-htmlpart1 div.rcmBody li.v1MsoNormal, #message-htmlpart1 div.rcmBody div.v1MsoNormal
                            { margin: 0cm; font-size: 10.0pt; font-family: "Calibri",sans-serif; }
                        #message-htmlpart1 div.rcmBody h1
                            { mso-style-priority: 9; mso-style-link: "Heading 1 Char"; mso-margin-top-alt: auto; margin-right: 0cm; mso-margin-bottom-alt: auto; margin-left: 0cm; font-size: 24.0pt; font-family: "Calibri",sans-serif; font-weight: bold; }
                        #message-htmlpart1 div.rcmBody h2
                            { mso-style-priority: 9; mso-style-link: "Heading 2 Char"; margin-top: 2.0pt; margin-right: 0cm; margin-bottom: 0cm; margin-left: 0cm; page-break-after: avoid; font-size: 13.0pt; font-family: "Calibri Light",sans-serif; color: #2F5496; font-weight: normal; }
                        #message-htmlpart1 div.rcmBody span.v1Heading1Char
                            { mso-style-name: "Heading 1 Char"; mso-style-priority: 9; mso-style-link: "Heading 1"; font-family: "Times New Roman",serif; mso-fareast-language: EN-GB; font-weight: bold; }
                        #message-htmlpart1 div.rcmBody span.v1Heading2Char
                            { mso-style-name: "Heading 2 Char"; mso-style-priority: 9; mso-style-link: "Heading 2"; font-family: "Calibri Light",sans-serif; color: #2F5496; }
                        #message-htmlpart1 div.rcmBody span.v1apple-converted-space
                            { mso-style-name: apple-converted-space; }
                        #message-htmlpart1 div.rcmBody .v1MsoChpDefault
                            { mso-style-type: export-only; font-size: 10.0pt; }
                        @page WordSection1
                            { size: 612.0pt 792.0pt; margin: 72.0pt 72.0pt 72.0pt 72.0pt; }
                        #message-htmlpart1 div.rcmBody div.v1WordSection1
                            { }
                        
                        @list l0
                            { mso-list-id: 384643365; mso-list-template-ids: 860935196; }
                        @list l0:level1
                            { mso-level-tab-stop: 36.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level2
                            { mso-level-tab-stop: 72.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level3
                            { mso-level-tab-stop: 108.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level4
                            { mso-level-tab-stop: 144.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level5
                            { mso-level-tab-stop: 180.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level6
                            { mso-level-tab-stop: 216.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level7
                            { mso-level-tab-stop: 252.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level8
                            { mso-level-tab-stop: 288.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l0:level9
                            { mso-level-tab-stop: 324.0pt; mso-level-number-position: left; text-indent: -18.0pt; }
                        @list l1
                            { mso-list-id: 1553690363; mso-list-template-ids: -736616126; }
                        #message-htmlpart1 div.rcmBody ol
                            { margin-bottom: 0cm; }
                        #message-htmlpart1 div.rcmBody ul
                            { margin-bottom: 0cm; }</style>
                        
                        <div class="rcmBody" lang="en-SE" link="#0563C1" vlink="#954F72" style="word-wrap: break-word">
                        <div class="v1WordSection1">
                        <p class="v1MsoNormal"><span style="font-size: 14.0pt; mso-fareast-language: EN-US">&nbsp;<!-- o ignored --></span></p>
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="800" style="width: 600.0pt; background: white; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td style="padding: 15.0pt 0cm 15.0pt 0cm">
                        <div align="center">
                        <table class="v1MsoNormalTable" dir="rtl" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; background: white; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td width="60%" style="width: 60.0%; padding: 0cm 0cm 0cm 0cm">
                        <p class="v1MsoNormal" dir="LTR" style="mso-margin-top-alt: 8.25pt; margin-right: 0cm; margin-bottom: 8.25pt; margin-left: 0cm; line-height: 26.65pt">
                        <b><span style="font-size: 24.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; letter-spacing: -.3pt">
                        Great news!&nbsp;</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        <p class="v1MsoNormal" dir="LTR" style="line-height: 3.0pt; background: #FFF895; vertical-align: top">
                        <span style="font-size: 3.0pt; font-family: &quot;Proxima Nova&quot;; color: black">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        <p class="v1MsoNormal"><span style="font-size: 11.0pt">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="800" style="width: 600.0pt; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td style="padding: 3.75pt 3.75pt 3.75pt 3.75pt">
                        <p class="v1MsoNormal"><b><span lang="EN-US" style="font-size: 13.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: -.1pt">Hello ${
													userDetails.name
												}</span></b><b><span style="font-size: 13.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: -.1pt">&nbsp;</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 6.75pt 3.75pt 6.75pt 3.75pt">
                        <p class="v1MsoNormal" style="font-size:12pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F;">Your order
                        </span><span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F">(id: ${id})
                        </span><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F"> has been delivered. We hope you enjoy your purchase. Click on the review button in app to let our sellers know how they can deliver better products and services.</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        <p class="v1MsoNormal"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td width="50%" valign="top" style="width: 50.0%; background: white; padding: 0cm 0cm 0cm 0cm">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="background: white; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td colspan="2" style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                        <p style="margin: 0cm"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; text-transform: uppercase; letter-spacing: .15pt; mso-fareast-language: EN-US">ORDER SUMMARY</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                        <p style="margin: 0cm; min-width: 55px; font-size:10pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Order No:</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                        <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${id}</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                        <p style="margin: 0cm; min-width: 55px"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Order Total:</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                        <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
													orderDetails?.paymentsDetails?.currency
												}${
							orderDetails.paymentsDetails.totalCharges
						}</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td valign="top" style="padding: 12.0pt 15.0pt 4.5pt 15.0pt">
                        <p style="margin: 0cm; min-width: 55px"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Payment :</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 12.0pt 15.0pt 4.5pt 18.75pt">
                        <p style="margin: 0cm"><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif; color: black; mso-fareast-language: EN-US">${
													orderDetails.paymentType
												}</span><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" width="305" style="width: 228.75pt; background: white; border-collapse: collapse; margin-bottom: -.75pt">
                        <tbody>
                        <tr>
                        <td style="padding: 0cm 15.0pt 4.5pt 15.0pt"></td>
                        </tr>
                        </tbody>
                        </table>
                        </td>
                        <td width="50%" valign="top" style="width: 50.0%; background: white; padding: 0cm 0cm 0cm 0cm">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="background: white; border-collapse: collapse; box-sizing: border-box">
                        <tbody>
                        <tr>
                        <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                        <p style="margin: 0cm"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; text-transform: uppercase; letter-spacing: .15pt; mso-fareast-language: EN-US">SHIPPING ADDRESS<span class="v1apple-converted-space">&nbsp;</span></span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                        <p style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Times New Roman&quot;,serif; color: black; mso-fareast-language: EN-US">Customer name : ${
													userDetails.name
												}</span><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 12.0pt 15.0pt 12.0pt 15.0pt">
                        <p style="margin: 0cm"><span lang="EN-US" style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">
                            name: ${userAddress.name},<br/>
                            addressLine1: ${userAddress.addressLine1},<br/>
                            addressLine2: ${userAddress.addressLine2},<br/>
                            city: ${userAddress.city},<br/>
                            state: ${userAddress.state},<br/>
                            postalCode: ${userAddress.postalCode},<br/>
                            country: ${userAddress.country},<br/>
                            addressType: ${userAddress.addressType},<br/>
                            mobile: ${userAddress.mobile}.
                        </span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td style="padding: 0cm 3.75pt 0cm 3.75pt">
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse">
                        <tbody>
                        <tr>
                        <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        <h1 style="margin: 0cm; mso-line-height-alt: 9.0pt; text-transform: capitalize"><span style="font-size: 10.5pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: .15pt; mso-fareast-language: EN-US">Confirmed Items</span><!-- o ignored --></h1>
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse; box-sizing: content-box; min-width: 100%">
                        <tbody>
                        <tr>
                        <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        <h2 style="margin-top: 0cm; mso-line-height-alt: 9.75pt"><span style="font-size: 10.0pt; font-family: &quot;Proxima Nova&quot;; color: #383838; letter-spacing: .15pt; mso-fareast-language: EN-US">&nbsp;</span><span style="mso-fareast-language: EN-US"><!-- o ignored --></span></h2>
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; background: white; border-collapse: collapse; box-sizing: content-box; min-width: 600px">
                        <tbody>
                        <tr>
                        <td width="80" style="width: 60.0pt; padding: 7.5pt 6.0pt 7.5pt 6.0pt"></td>
                        <td valign="top" style="padding: 7.5pt 6.0pt 7.5pt 11.25pt">
                        <div align="right">
                        <table class="v1MsoNormalTable" dir="rtl" border="0" cellspacing="0" cellpadding="0" width="591" style="width: 443.35pt; border-collapse: collapse; box-sizing: content-box">
                        <tbody>
                        ${
													result2
														? result2.items.map((item: any, index: any) => {
																return `
                            <tr style="height: 14.8pt">
                                <td valign="top" style="padding: .75pt .75pt .75pt .75pt; height: 14.8pt">
                                    <p class="v1MsoNormal" align="right" dir="LTR" style="text-align: right; line-height: 12.0pt; font-size: 12pt">
                                    <b><span style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${orderDetails?.paymentsDetails?.currency}${item.itemPrice}</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                                </td>
                                <td valign="top" style="padding: .75pt .75pt .75pt 0cm; height: 14.8pt">
                                    <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #505E83; mso-fareast-language: EN-US">Brand : ${item.itemBrand.name}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                    <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #505E83; mso-fareast-language: EN-US">Category : ${item.itemCategory.name}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                    <p dir="LTR" style="margin: 0cm"><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Item : ${item.itemName}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                    <p dir="LTR" style="margin: 0cm; line-height: 12.0pt"><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Quantity :
                                    </span><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">${item.quantity}</span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                    <p dir="LTR" style="margin: 0cm; font-size: 12.0pt; line-height: 9.0pt"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #84FB51; mso-fareast-language: EN-US">
                                    </span></b><b><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #84FB51; mso-fareast-language: EN-US">Delivered</span></b><span class="v1apple-converted-space"><b><span style="font-size: 9.0pt; font-family: &quot;Proxima Nova&quot;; color: #84FB51; mso-fareast-language: EN-US">&nbsp;</span></b></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                                </td>
                            </tr>
                            `;
														  })
														: ''
												}
                        </tbody>
                        </table>
                        </div>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        <p class="v1MsoNormal" style="line-height: 12.0pt"><span style="font-size: 11.0pt; font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width: 450.0pt; border-collapse: collapse; box-sizing: content-box; min-width: 100%">
                        <tbody>
                        <tr>
                        <td style="border: none; border-bottom: solid white 1.0pt; padding: 0cm 0cm 0cm 0cm"></td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 3.75pt 3.75pt 3.75pt 3.75pt">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left" style="border-collapse: collapse; box-sizing: content-box">
                        <tbody>
                        <tr>
                        <td style="padding: 10.5pt 12.0pt 7.5pt 15.0pt">
                        <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Subtotal</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 10.5pt 15.0pt 7.5pt 15.0pt">
                        <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; font-size:12pt">
                        <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
													orderDetails?.paymentsDetails?.currency
												}${
							JSON.parse(JSON.stringify(orderDetails?.paymentsDetails))[
								'sub_total'
							]
						}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr style="height: 4.0pt">
                        <td style="padding: 15.0pt 12.0pt 7.5pt 15.0pt; height: 4.0pt">
                        <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt"><span style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Shipping Fee</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt; height: 4.0pt">
                        <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; font-size:12pt">
                        <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
													orderDetails?.paymentsDetails?.currency
												}${
							orderDetails.paymentsDetails.shippingCharges
						}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr style="height: 10.85pt">
                        <td style="padding: 15.0pt 12.0pt 7.5pt 15.0pt; height: 10.85pt">
                        <p class="v1MsoNormal" style="mso-line-height-alt: 9.75pt; font-size:12pt"><span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #646B82; mso-fareast-language: EN-US">Tax Fee</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt; height: 10.85pt">
                        <p class="v1MsoNormal" align="right" style="text-align: right; mso-line-height-alt: 9.75pt; ; font-size:12pt">
                        <span lang="EN-US" style="font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
													orderDetails?.paymentsDetails?.currency
												}${
							orderDetails.paymentsDetails.taxAmount
						}</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td valign="bottom" style="padding: 9.75pt 12.0pt 7.5pt 15.0pt">
                        <p class="v1MsoNormal" style="line-height: 12.0pt; font-size:12pt"><b><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Total<span class="v1apple-converted-space">&nbsp;</span></span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        <td style="padding: 9.75pt 15.0pt 7.5pt 15.0pt">
                        <p class="v1MsoNormal" align="right" style="text-align: right; line-height: 12.0pt"><b><span lang="EN-US" style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">${
													orderDetails?.paymentsDetails?.currency
												}${
							orderDetails?.paymentsDetails?.totalCharges
						}</span></b><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 15.0pt 15.0pt 7.5pt 15.0pt"></td>
                        <td style="padding: 15.0pt 15.0pt 15.0pt 15.0pt"></td>
                        </tr>
                        </tbody>
                        </table>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 26.25pt 0cm 26.25pt 0cm">
                        <div align="center">
                        <table class="v1MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="610" style="width: 457.5pt; border-collapse: collapse; box-sizing: content-box">
                        <tbody>
                        <tr>
                        <td style="padding: 15.0pt 3.75pt 0cm 3.75pt">
                        <p class="v1MsoNormal" style="line-height: 12.0pt"><span style="font-size: 11.0pt; font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">&nbsp;</span><span style="font-size: 11.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></p>
                        <p style="margin: 0cm"><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">We're doing everything we can to ensure you get your order safely by:<span class="v1apple-converted-space">&nbsp;</span></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        <ol start="1" type="1">
                        <li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                        <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Sanitizing our facilities</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li><li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                        <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Monitoring hygiene</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li><li class="v1MsoNormal" style="color: #30343F; mso-margin-top-alt: auto; mso-margin-bottom-alt: auto; mso-line-height-alt: 9.75pt; mso-list: l0 level1 lfo3">
                        <span style="font-family: &quot;Proxima Nova&quot;; mso-fareast-language: EN-US">Providing contactless payment options</span><span style="font-size: 12.0pt; mso-fareast-language: EN-US"><!-- o ignored --></span></li></ol>
                        <p style="margin: 0cm"><span style="font-size: 12.0pt; font-family: &quot;Proxima Nova&quot;; color: #30343F; mso-fareast-language: EN-US">Until then, stay safe at home while we deliver to you.<span class="v1apple-converted-space">&nbsp;</span></span><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 13.5pt 3.75pt 0cm 3.75pt">
                        <p style="margin: 0cm"><b><span lang="EN-US" style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">Thanks</span></b><b><span style="font-size: 10.5pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">,<br>
                        The </span></b><b><span lang="EN-US" style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">MBE
                        </span></b><b><span style="font-size: 12pt; font-family: &quot;Proxima Nova&quot;; color: #383838; mso-fareast-language: EN-US">&nbsp;team</span></b><span style="font-size: 10.0pt; font-family: &quot;Times New Roman&quot;,serif"><!-- o ignored --></span></p>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                        </td>
                        </tr>
                        </tbody>
                        </table>
                        <p class="v1MsoNormal"><span style="font-size: 12.0pt; mso-fareast-language: EN-US">&nbsp;<!-- o ignored --></span></p>
                        </div>
                        </div>
                        </div>`;
						var mailOptions = {
							// from: 'subodhiat8@gmail.com',
							from: 'Social@multibrandselectronics.com',
							to: userDetails.email,
							subject: `Order ${dto.orderStatus} | MBE`,
							//text: `Passsword reset link ${variableAndValues[2].value}`,
							html: emalhtml,
						};
						transporter.sendMail(mailOptions, function (error: any, info: any) {
							if (error) {
								console.log(error);
							} else {
								console.log('Email sent: ' + info.response);
							}
						});
					}
				});
			}

			if (dto.orderStatus == 'Shipped') {
				axios({
					method: 'post',
					url: 'https://fcm.googleapis.com/fcm/send',
					headers: {
						Authorization:
							'Bearer AAAA960yEqE:APA91bGRnNZXOYM7EJYf-mW45szpTo5A0XoAuIafmgEyDs1P_SNcsKQriM-S1G6cgDoaldVx7VJshStKfvkyiEr2uqUWoznc6FAaCzGUmnpXCP6P-SGtaHG52u28l4hgMt8aCVSmmXol',
						'Content-Type': 'application/json',
					},
					data: {
						to: userDetails.fcmToken,
						notification: {
							body: 'Your order has been shipped.',
							title: 'Order Shipped',
						},
						'gcm.message_id': '123',
					},
				}).then((res: any) => {
					console.log(res);
				});
			}

			res.json({ success: true, status: 'updated successfully!' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public updateOrdersStatus = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const transactionID = req.query.transaction_id;
			const result = this.orderDAO.updatestatus(id, transactionID.toString());
			res.json({ success: true, status: 'updated successfully!' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public deleteOrderIfCancelled = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const result = this.orderDAO.deleteOrderIfCancelled(id);
			res.json({ success: true, status: 'Deleted successfully!' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public failedOrdersStatus = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const transactionID = req.query.transaction_id;
			const result = this.orderDAO.updatefailedstatus(
				id,
				transactionID.toString()
			);
			res.json({ success: true, status: 'updated successfully!' });
		} catch (err) {
			catchError(err, next);
		}
	};
	private async MakePaymentDetails(
		id: string,
		amount: string,
		currency: string,
		paymentOptions: string,
		email: string,
		phonenumber: string,
		name: string
	): Promise<any> {
		return await axios({
			method: 'post',
			url: 'https://api.flutterwave.com/v3/payments',
			headers: {
				Authorization: 'Bearer FLWSECK_TEST-42681e219ab0d3e47680bafb414ee6d7-X',
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			data: {
				tx_ref: `mbe-${id}`,
				amount,
				currency,
				payment_options: paymentOptions,
				redirect_url: `https://api.multibrandselectronics.com/mbe/payment/success/${id}`,
				customer: { email, name, phonenumber },
				customizations: {
					title: 'MBE Order Payment',
					description: '',
					logo: '',
				},
			},
		})
			.then((response: any) => {
				return response.data;
			})
			.catch(() => {
				const a = 1;
				return {};
			});
	}

	private async GetPaymentDetails(id: string): Promise<any> {
		return await axios({
			method: 'get',
			url: `https://api.flutterwave.com/v3/transactions/${id}/verify`,
			headers: {
				Authorization: 'Bearer FLWSECK_TEST-42681e219ab0d3e47680bafb414ee6d7-X',
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		})
			.then((response: any) => {
				return response.data;
			})
			.catch(() => {
				const a = 1;
				return {};
			});
	}
	private async AddBankReceipentDetails(
		bName: string,
		aNumb: string,
		aBank: string
	): Promise<any> {
		return await axios({
			method: 'post',
			url: 'https://api.ravepay.co/v2/gpx/transfers/beneficiaries/create',
			headers: {
				Authorization: 'Bearer FLWSECK_TEST-42681e219ab0d3e47680bafb414ee6d7-X',
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			data: {
				currency: 'NGN',
				beneficiary_name: bName,
				account_number: aNumb,
				account_bank: aBank,
				seckey: 'FLWSECK_TEST-42681e219ab0d3e47680bafb414ee6d7-X',
			},
		})
			.then((response: any) => {
				return response.data;
			})
			.catch(() => {
				const a = 1;
				return {};
			});
	}

	private async GetAccountDetails(id: string): Promise<any> {
		return await axios({
			method: 'get',
			url: `https://api.ravepay.co/v2/gpx/transfers/beneficiaries?id=${id}&seckey=FLWSECK_TEST-42681e219ab0d3e47680bafb414ee6d7-X`,
			headers: {
				Authorization: 'Bearer FLWSECK_TEST-42681e219ab0d3e47680bafb414ee6d7-X',
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		})
			.then((response: any) => {
				return response.data;
			})
			.catch(() => {
				const a = 1;
				return {};
			});
	}

	private async InitiateRefundedToUser(
		amt: number,
		aNumb: string,
		aBank: string
	): Promise<any> {
		return await axios({
			method: 'post',
			url: 'https://api.flutterwave.com/v3/transfers',
			headers: {
				Authorization: 'Bearer FLWSECK_TEST-42681e219ab0d3e47680bafb414ee6d7-X',
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			data: {
				currency: 'NGN',
				account_bank: aBank,
				account_number: aNumb,
				amount: amt,
				narration: '',
				reference: 'akhlm-pstmnpyt-rfxx007_PMCKDU_1',
				callback_url:
					'https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d',
				debit_currency: 'NGN',
			},
		})
			.then((response: any) => {
				return response.data;
			})
			.catch(() => {
				const a = 1;
				return {};
			});
	}
	public initiateRefund = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const amt = req.query.amount;
			const user = await this.userDAO.getById(id);
			const ress = await this.GetAccountDetails(user.beneficiaryId);
			const resp = await this.InitiateRefundedToUser(
				parseInt(amt.toString(), 10),
				ress.payout_beneficiaries.account_number,
				ress.payout_beneficiaries.bank_name
			);

			res.json({ success: true, status: 'success' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public addUserBankRefund = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const body = req.body;
			const ress = await this.AddBankReceipentDetails(
				body['name'],
				body['account_number'],
				body['bank_name']
			);
			const benId = ress.data.id;
			const usEr = await this.userDAO.updateBenId(body['userid'], benId);
			res.json({ success: true, status: 'updated successfully!' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public totalDashBoard = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const fromdate: any = req.query.fromdate;
			const todate: any = req.query.todate;
			const orders = await this.orderDAO.getAllOrders(fromdate, todate);
			const notDeliveredOrders = await this.orderDAO.getAllNotDeliveredOrders(
				fromdate,
				todate
			);
			const users = await this.userDAO.getDashbordUsers(fromdate, todate);
			const cartIds = [];
			const itemId = [];

			let total = 0;
			let profittotal = 0;
			let shippingTotal = 0;
			let taxTotal = 0;
			let pendingBalance: any = 0;

			// const filter1: any = { };
			// filter1.$or = [{ status: 'Active' }, {status: 'Active' }];
			// const shipping = await this.shippingDAO.getByFilter1(filter1);
			// let shipping_fees, shipping_type;
			// if(shipping !==null){
			//     shipping_fees = parseInt(shipping[0].shipping_value,10);
			//     shipping_type = shipping[0].shipping_amount_type;
			// }
			pendingBalance = notDeliveredOrders.reduce((ret: any, cItem: any) => {
				ret += cItem.paymentsDetails.totalCharges;
				return ret;
			}, 0);

			// console.log('pendingBalance###', pendingBalance)

			for (let con of orders) {
				total = total + con.paymentsDetails.totalCharges;
				shippingTotal =
					shippingTotal + con.paymentsDetails.shippingCharges
						? con.paymentsDetails.shippingCharges
						: 0;
				taxTotal =
					taxTotal + con.paymentsDetails.taxAmount
						? con.paymentsDetails.taxAmount
						: 0;
				if (con.cartId) {
					cartIds.push({ _id: mongoose.Types.ObjectId(con.cartId) });
				}

				profittotal += con.paymentsDetails.profitTotal;

				const carts = await this.cartDAO.getByIds({ $or: cartIds });

				for (const sid of carts) {
					// console.log('sid',sid);
					if (con.cartId === sid._id.toString()) {
						for (const j of sid.items) {
							itemId.push({ itemId: mongoose.Types.ObjectId(j.itemId) });
						}
					}
				}
			}

			const items = await this.itemsDAO.getDashboardItems(fromdate, todate);

			res.json({
				success: true,
				orders: orders.length,
				users: users.length,
				revenue: total,
				profit: profittotal,
				products: items.length,
				shippingTotal,
				taxTotal,
				pendingBalance,
			});
		} catch (err) {
			catchError(err, next);
		}
	};
}
