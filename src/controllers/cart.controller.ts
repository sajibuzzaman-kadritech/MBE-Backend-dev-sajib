import { json } from 'body-parser';
import config from 'config';
import express from 'express';
import mongoose from 'mongoose';
import CartDAO from '../daos/cart.dao';
import ItemsDAO from '../daos/items.dao';
import { CartAddDTO, CartDTO } from '../dtos/cart.dto';
import ItemsDTO from '../dtos/items.dto';
import ShippingtaxDTO from '../dtos/shippingtax.dto';
import ShippingtaxDAO from '../daos/shippingtax.dao';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
import AdminsettingsDAO from '../daos/adminsettings.dao';
import taxDAO from '../daos/tax.dao';
import taxDTO from '../dtos/tax.dto';
export class Cart {
	private readonly CartDAO: CartDAO;
	private readonly itemsDAO: ItemsDAO;
	private readonly adminsettingsDAO: AdminsettingsDAO;
	private readonly shippingtaxDAO: ShippingtaxDAO;
	private readonly taxDAO: taxDAO;
	constructor() {
		this.CartDAO = new CartDAO();
		this.itemsDAO = new ItemsDAO();
		this.adminsettingsDAO = new AdminsettingsDAO();
		this.shippingtaxDAO = new ShippingtaxDAO();
		this.taxDAO = new taxDAO();
	}
	public getByUserId = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const l = [];
			const id = req.params.id;
			let result: any = await this.CartDAO.getCartByUserId(id);
			// result = result[0];

			if (result === null) {
				res.json({ status: false, message: 'No data found!' });
				return;
			}

			const filter1: any = {};
			filter1.$or = [{ status: 'Active' }, { status: 'Active' }];
			const shipping = await this.shippingtaxDAO.getByFilter1(filter1); //get shipping data
			const tax = await this.taxDAO.getByFilter1(filter1); //get tax data
			let total = 0;
			let sub_total = 0;
			let taxes = 0;
			let shipping_fees = 0;
			let shipping_type = '';
			let tax_type = '';
			if (tax !== null && tax.length > 0) {
				taxes = parseInt(tax[0].tax_value, 10);
				tax_type = tax[0].tax_type;
			}
			if (shipping !== null && shipping.length > 0) {
				shipping_fees = parseInt(shipping[0]?.shipping_value, 10);
				shipping_type = shipping[0]?.shipping_amount_type;
			}

			for (const i of result.items) {
				let item: any = await this.itemsDAO.getItemById(i.itemId);
				item = item[0];
				item.quantity = i.quantity;
				//total = total + item.price * i.quantity;
				const str = item.deal.toString();
				let disCountPrice = item.price;
				if (str) {
					const dealType = str.split(' ')[1];
					const dealPrice = str.split(' ')[0];
					if (dealType === '%') {
						disCountPrice =
							item.price - (item.price * parseInt(dealPrice, 10)) / 100;
					} else if (dealType === 'off') {
						disCountPrice = item.price - parseInt(dealPrice, 10);
					} else {
						disCountPrice = item.price;
					}
				}
				total = total + disCountPrice * i.quantity;
				item.added = result.added;
				item.updated = result.added;
				item.disCountPrice = disCountPrice;
				const newImages = [];
				l.push(item);
			}
			const resBody: CartDTO = {
				_id: result._id,
				added: result.added,
				userId: result.userId,
				is_ordered: result.is_ordered,
				items: l,
			};

			let shipping_amount = 0;
			if (shipping_type === 'fixed') {
				shipping_amount = shipping_fees;
			} else if (shipping_type === '%') {
				shipping_amount = (total * shipping_fees) / 100;
			}
			let taxes_amount = 0;
			if (tax_type === 'fixed') {
				taxes_amount = taxes;
			} else if (tax_type === '%') {
				taxes_amount = (total * taxes) / 100;
			}

			let cart_sub_total = {
				total_amount: Number(total + taxes_amount + shipping_amount).toFixed(2),
				taxes: taxes,
				taxesType: tax_type,
				shipping_fees: shipping_fees,
				shippingType: shipping_type,
				sub_total: total,
			};
			const filter: any = {};
			filter.$or = [{ status: 'Active' }, { status: 'Not Active' }];
			const est_data = await this.adminsettingsDAO.getByFilter1(filter);

			res.json({
				success: true,
				status: 'added successfully!',
				data: resBody,
				cartTotal: cart_sub_total,
				est_delivery: est_data[0].est_delivery,
			});
		} catch (err) {
			catchError(err, next);
		}
	};
	public getById = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const result = await this.CartDAO.getById(id);
			const l = [];
			let total = 0;
			for (const i of result.items) {
				const item: ItemsDTO = await this.itemsDAO.getItemById(i.itemId);
				item.quantity = i.quantity;
				total = total + item.price * i.quantity;
				item.added = result.added;
				item.updated = result.added;
				l.push(item);
			}
			const resBody: CartDTO = {
				_id: result._id,
				added: result.added,
				userId: result.userId,
				is_ordered: 'No',
				items: l,
			};
			const filter: any = {};
			filter.$or = [{ status: 'Active' }, { status: 'Not Active' }];
			const est_data = await this.adminsettingsDAO.getByFilter1(filter);

			res.json({
				data: resBody,
				cartTotal: total,
				est_delivery: est_data[0].est_delivery,
			});
		} catch (err) {
			catchError(err, next);
		}
	};
	public getAllUsersCarts = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const result = await this.CartDAO.getAllUsersCarts();
			res.json(result);
		} catch (err) {
			catchError(err, next);
		}
	};
	public deleteCart = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const result = await this.CartDAO.delete(id);
			if (result) {
				res.json({
					success: true,
					status: 'delete cart successfully!',
					result: req.params.id,
				});
			} else {
				res.json({
					success: true,
					status: 'cart id not found!',
					result: req.params.id,
				});
			}
		} catch (err) {
			catchError(err, next);
		}
	};

	public addItemToCart = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const dto: CartAddDTO = req.body;
			const cart = await this.CartDAO.getCartByUserId(dto.userId);
			if (cart) {
				//res.json({ success: true, status: 'INN' });
				let itemlist = [];
				let newItem = false;
				//cart has items
				if (cart.items.length > 0) {
					for (const i of cart.items) {
						if (i.itemId === dto.itemId) {
							if (dto.quantity > 0) {
								i.quantity = dto.quantity;
								itemlist.push(i);
							}
							newItem = true;
						} else {
							itemlist.push(i);
						}
					}
					if (!newItem && dto.quantity > 0) {
						let item: any = await this.itemsDAO.getItemById(dto.itemId);
						item = item[0];
						console.log('add to cart if', item);
						itemlist.push({
							itemId: dto.itemId,
							quantity: dto.quantity,
							itemName: item.name,
							itemPrice: item.price,
							itemDeal: item.deal,
							itemBrand: item.brand,
							itemCategory: item.category,
							itemImages: item.images,
						});
						console.log('itemlist', itemlist);
					}
					//cart doesn't have any items
				} else {
					if (dto.quantity > 0) {
						let item: any = await this.itemsDAO.getItemById(dto.itemId);
						item = item[0];
						console.log('add to cart else', item);
						itemlist.push({
							itemId: dto.itemId,
							quantity: dto.quantity,
							itemName: item.name,
							itemPrice: item.price,
							itemDeal: item.deal,
							itemBrand: item.brand,
							itemCategory: item.category,
							itemImages: item.images,
						});
					}
				}
				const result = this.CartDAO.update(cart._id, itemlist);
				//GET UPDATED CART
				const l = [];
				const result2 = await this.CartDAO.getCartByUserId(dto.userId);
				let total = 0;
				let sub_total = 0;
				let taxes = 10;
				let shipping_fees = 10;
				for (const i of result2.items) {
					const item: ItemsDTO = await this.itemsDAO.getItemById(i.itemId);
					item.quantity = i.quantity;
					total = total + item.price * i.quantity;
					item.added = result2.added;
					item.updated = result2.added;
					l.push(item);
				}
				/* const resBody: CartDTO = {
          _id: result2._id,
          added: result2.added,
          userId: result2.userId,
          items: await this.CartDAO.getCartByUserId(dto.userId)
        };
        */
				const resBody = await this.CartDAO.getCartByUserId(dto.userId);
				//res.json({ data: resBody, cartTotal: total });
				//END GET CART
				let cart_sub_total;
				if (resBody.items.length == 0) {
					cart_sub_total = 0;
				} else {
					cart_sub_total = {
						sub_total: total - taxes - shipping_fees,
						taxes: taxes,
						shipping_fees: shipping_fees,
						total_amount: total,
					};
				}
				res.json({
					success: true,
					status: 'update successfully!',
					data: resBody,
					cartTotal: cart_sub_total,
				});
			} else {
				let item: any = await this.itemsDAO.getItemById(dto.itemId);
				item = item[0];

				// console.log("else no cart create", item);
				const adddto: CartDTO = {
					userId: dto.userId,
					is_ordered: 'No',
					_id: mongoose.Types.ObjectId().toHexString(),
					added: {
						at: new Date(),
					},
					items: [
						{
							itemId: dto.itemId,
							quantity: dto.quantity,
							itemName: item.name,
							itemPrice: item.price,
							itemDeal: item.deal,
							itemBrand: item.brand,
							itemCategory: item.category,
							itemImages: item.images,
						},
					],
				};
				const result = await this.CartDAO.create(adddto);
				//GET UPDATED CART
				const l = [];
				const result2 = await this.CartDAO.getCartByUserId(dto.userId);
				let total = 0;
				let sub_total = 0;
				let taxes = 10;
				let shipping_fees = 10;
				for (const i of result2.items) {
					const item: ItemsDTO = await this.itemsDAO.getItemById(i.itemId);
					item.quantity = i.quantity;
					total = total + item.price * i.quantity;
					item.added = result2.added;
					item.updated = result2.added;
					result2.is_ordered = 'No';
					l.push(item);
				}
				//res.json(result2.is_ordered);
				const resBody: CartDTO = {
					_id: result2._id,
					added: result2.added,
					userId: result2.userId,
					is_ordered: result2.is_ordered,
					items: l,
				};
				//res.json({ data: resBody, cartTotal: total });
				//END GET CART
				let cart_sub_total = {
					sub_total: sub_total,
					taxes: taxes,
					shipping_fees: shipping_fees,
					total_amount: total,
				};
				res.json({
					success: true,
					status: 'added successfully!',
					data: resBody,
					cartTotal: cart_sub_total,
				});
				//res.json({ success: true, status: 'added successfully!' });
			}
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
}
