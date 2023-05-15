import config from 'config';
import express from 'express';
import jwt_decode from 'jwt-decode';
import mongoose from 'mongoose';
import { title } from 'process';
import { validateLocaleAndSetLanguage } from 'typescript';
import CartDAO from '../daos/cart.dao';
import FavouriteDAO from '../daos/favourite.dao';
import ItemsDAO from '../daos/items.dao';
import UserDAO from '../daos/user.dao';
import FavouriteDTO from '../dtos/favourite.dto';
import ItemsDTO from '../dtos/items.dto';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
import ReviewDAO from '../daos/review.dao';
import CategoryDAO from '../daos/category.dao';
import BrandDAO from '../daos/brands.dao';
import { CartDTO } from '../dtos/cart.dto';
import { ObjectId, ObjectID } from 'bson';

export class Items {
	private readonly userDAO: UserDAO;
	private readonly itemsDAO: ItemsDAO;
	private readonly cartDao: CartDAO;
	private readonly favouriteDAO: FavouriteDAO;
	private readonly reviewDAO: ReviewDAO;
	private readonly categoryDAO: CategoryDAO;
	private readonly brandDAO: BrandDAO;

	constructor() {
		this.itemsDAO = new ItemsDAO();
		this.cartDao = new CartDAO();
		this.userDAO = new UserDAO();
		this.favouriteDAO = new FavouriteDAO();
		this.reviewDAO = new ReviewDAO();
		this.categoryDAO = new CategoryDAO();
		this.brandDAO = new BrandDAO();
	}

	public getByBrands = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const brand = req.params.name;
			const result = await this.itemsDAO.getItemsByBrand(brand);
			res.json({ result });
		} catch (err) {
			catchError(err, next);
		}
	};

	public getItems = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			let limit = '100';
			let offset = '0';
			if (req.query.limit && req.query.limit !== '') {
				limit = req.query.limit.toString();
			}
			if (req.query.offset && req.query.limit !== '') {
				offset = req.query.offset.toString();
			}
			let pricel = '0';
			let priceu = '999999';
			let pricel2 = '999999';
			let priceu2 = '0';
			const name = req.query.name;
			const brand: any = req.query.brand;
			const category: any = req.query.category;
			const discount: any = req.query.discount;
			const features: any = req.query.features;
			const rating = req.query.rating;
			const rating_wise = req.query.rating_wise;
			//const deal = req.query.deal;
			const dealofday = req.query.dealofday;
			const featured = req.query.featured;
			const userId = req.query.userId;
			let newest = req.query.newest;
			console.log('newest', newest);
			let oldest = req.query.oldest;
			let price_low_to_high = req.query.price_low_to_high;
			let price_high_to_low = req.query.price_high_to_low;
			let sort_name = req.query.sort_name;

			const filter: any = {};
			if (featured && featured !== '' && featured === 'true') {
				filter.featured = true;
			}
			if (dealofday && dealofday !== '' && dealofday === 'true') {
				filter.dealofDay = true;
			}
			if (name && name !== '') {
				filter.name = { $regex: name, $options: 'i' };
			}
			if (brand && brand !== '') {
				let tempString = brand;
				const brandArray = tempString.split(',');
				filter['brand._id'] = { $in: brandArray };
			}
			if (category && category !== '') {
				let tempString = category;
				const categoryArray = tempString.split(',');
				filter['category._id'] = { $in: categoryArray };
			}
			if (discount && discount !== '') {
				let discountString = discount;
				const discountArray = discountString.replace(/%/g, ' %').split(',');
				filter.deal = { $in: discountArray };
			}
			if (features && features !== '') {
				let featuresString = features;
				const featuresArray = featuresString.split(',');
				//{title:'',description:''} { $in: featuresArray }
				//filter.keyFeatures[0].title  = 'honor';//{ title:'honor' };
			}
			if (req.query.pricel && req.query.pricel !== '') {
				pricel = req.query.pricel.toString();
			}
			if (req.query.priceu && req.query.priceu !== '') {
				priceu = req.query.priceu.toString();
			}
			//filter.price = { $gte: parseInt(priceu2.toString(), 10), $lte:  parseInt(pricel2.toString(), 10) };
			filter.price = {
				$gte: parseInt(pricel.toString(), 10),
				$lte: parseInt(priceu.toString(), 10),
			};
			if (rating && rating !== '') {
				filter.rating = { $gte: parseInt(rating.toString(), 10) };
			}

			const items: ItemsDTO[] = await this.itemsDAO.getByFilter(
				filter,
				limit,
				offset
			);

			// console.log('items', items);

			const resultBody = [];
			for (const val of items) {
				// console.log('#####val.category._id',val);

				// let category:any = await this.categoryDAO.find({ _id: new ObjectId(val.category._id) });
				// let brand:any = await this.brandDAO.find({ _id: new ObjectId(val.brand._id) });

				// console.log("#####category",category);

				// const newImages = [];
				// if (val.images) {
				//   for (const don of val.images) {
				//     const filenameL = don.split('?')[0];
				//     const filename = filenameL.split('/')[filenameL.split('/').length - 1];
				//     const url = await this.readPreSignedUrl(filename);
				//     newImages.push(url);
				//   }
				//
				//   val.images = newImages;
				// }

				const r = /\d+/;
				const rT = /\%/;
				const rtO = /\$/;
				const str = val.deal.toString();
				let disCountPrice = val.price;
				if (str) {
					const dealType = str.split(' ')[1];
					const dealPrice = str.split(' ')[0];
					if (dealType === '%') {
						disCountPrice =
							val.price - (val.price * parseInt(dealPrice, 10)) / 100;
					} else if (dealType === 'off') {
						disCountPrice = val.price - parseInt(dealPrice, 10);
					} else {
						disCountPrice = val.price;
					}
				}
				/*const valueOfDiscount = str.match(r);
                 const typeOfDiscount1 = str.match(rT);
                 const typeOfDiscount2 = str.match(rtO);

                 if (typeOfDiscount1) {
                   disCountPrice = val.price - (val.price * parseInt(valueOfDiscount[0], 10) / 100);
                 } else if (typeOfDiscount2) {
                   disCountPrice = val.price - parseInt(valueOfDiscount[0], 10);
                 } else {
                   disCountPrice = val.price;
                 }*/
				//console.log("str............." ,str);
				/*console.log("dealType............." ,dealType);
                console.log("valueOfDiscount............." ,valueOfDiscount);
                console.log("typeOfDiscount1............." ,typeOfDiscount1);
                console.log("typeOfDiscount2............." ,typeOfDiscount2);
                console.log("disCountPrice............." ,disCountPrice);*/
				const favItems = await this.favouriteDAO.getByItemId(val._id);
				const favByUser = await this.favouriteDAO.getByItemUserId(
					val._id,
					userId ? userId.toString() : ''
				);

				const body: ItemsDTO = JSON.parse(JSON.stringify(val));

				body.disCountPrice = disCountPrice;
				body.favouriteByUser = false;
				body.favouriteCout = 0;
				body.newProduct = false;
				if (!favItems) {
					const timeDiff = Math.abs(
						new Date().getTime() - val.added.at.getTime()
					);
					const differentDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
					if (differentDays < 30) {
						body.newProduct = true;
					}
					//resultBody.sort((a,b) =>  new Date(val.added.at.getTime()) - new Date(val.added.at.getTime()));

					if (
						val.status == 'Active' &&
						val.category.status == 'Active' &&
						val.brand.status == 'Active'
					) {
						resultBody.push(body);
					}
				} else {
					body.favouriteCout = favItems.length;

					if (!favByUser) {
						const timeDiff = Math.abs(
							new Date().getTime() - val.added.at.getTime()
						);
						const differentDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
						if (differentDays < 30) {
							body.newProduct = true;
						}
						if (
							val.status == 'Active' &&
							val.category.status == 'Active' &&
							val.brand.status == 'Active'
						) {
							resultBody.push(body);
						}
					} else {
						body.favouriteByUser = true;
						const timeDiff = Math.abs(
							new Date().getTime() - val.added.at.getTime()
						);
						const differentDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
						if (differentDays < 30) {
							body.newProduct = true;
						}
						if (
							val.status == 'Active' &&
							val.category.status == 'Active' &&
							val.brand.status == 'Active'
						) {
							resultBody.push(body);
						}
					}
				}
			}
			if (price_low_to_high == 'true') {
				resultBody.sort((a, b) => a.price - b.price);
			}
			if (price_high_to_low == 'true') {
				resultBody.sort((a, b) => b.price - a.price);
			}
			if (newest == 'true') {
				// console.log('before resultBody', newest, resultBody);
				resultBody.sort(
					(y, x) => +new Date(x.added.at) - +new Date(y.added.at)
				);
				// console.log('after resultBody', newest, resultBody);
			}
			if (oldest == 'true') {
				resultBody.sort(
					(y, x) => +new Date(y.added.at) - +new Date(x.added.at)
				);
			}
			if (rating_wise == 'true') {
				resultBody.sort((a, b) => b.rating - a.rating);
			}
			if (sort_name == '0') {
				resultBody.sort((a, b) => (a.name > b.name ? -1 : 1)); //(a["name"] > b["name"]) ? 1 : (a["name"] < b["name"]) ? -1 : 0);
			}
			if (sort_name == '1') {
				resultBody.sort((a, b) => (b.name > a.name ? -1 : 1)); //(a["name"] > b["name"]) ? 1 : (a["name"] < b["name"]) ? -1 : 0);
			}
			res.json({ success: true, data: resultBody });
		} catch (err) {
			catchError(err, next);
		}
	};

	public topSellingItems = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const cart: any = await this.cartDao.getAllUsersCarts();

			console.log('cart', cart.length);

			let result = [];
			for (let c of cart) {
				if (
					c.category_obj.status == 'Active' &&
					c.brand_obj.status == 'Active'
				) {
					result.push(c);
				}
			}

			console.log('###result', result);

			var o: any = {};
			result = result.reduce(function (r: any, el: any) {
				var e = el.brand_obj._id;
				if (!o[e]) {
					o[e] = {
						itemBrand: el.brand_obj,
						quantity: 0,
						image: '',
						name: '',
						category: '',
						elements: [],
					};
					r.push(o[e]);
				}
				o[e].elements.push(el);
				let arr = o[e].elements;
				let quantity = 0;
				for (let item of arr) {
					quantity = quantity + item.quantity;
				}
				o[e].quantity = quantity;
				o[e].name = o[e].elements[0].itemName;
				o[e].image = o[e].elements[0].itemImages;
				o[e].category = o[e].elements[0].category_obj;
				return r;
			}, []);

			// console.log(result);

			// // console.log(result);

			let data = result.sort(function (one: any, other: any) {
				return -(one.quantity - other.quantity);
			});

			// let data = result.reduce(function(results:any, org:any) {
			//   (results[org.itemBrand] = results[org.itemBrand] || []).push(org);
			//   return results;
			// }, {})

			res.json({ success: true, result });
		} catch (err) {
			catchError(err, next);
		}
	};

	public getItemsSerach = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			let limit = '100';
			let offset = '0';
			if (req.query.limit && req.query.limit !== '') {
				limit = req.query.limit.toString();
			}
			if (req.query.offset && req.query.limit !== '') {
				offset = req.query.offset.toString();
			}

			const serach: any = req.params.key;
			let filter: any = {};
			// let searchFilter ;
			if (serach && serach !== '') {
				filter =
					// "$or": [
					//     { name: { $regex: req.params.key, $options: 'i' } },
					//     { brand: { $regex: req.params.key, $options: 'i' } },
					//     { category: { $regex: req.params.key, $options: 'i' } }
					// ]
					[
						{
							$match: {
								$or: [
									{
										name: {
											$regex: req.params.key,
											$options: 'i',
										},
									},
									{
										'brand.name': {
											$regex: req.params.key,
											$options: 'i',
										},
									},
									{
										'category.name': {
											$regex: req.params.key,
											$options: 'i',
										},
									},
								],
							},
						},
					];
			}

			// console.log("%%filter", JSON.stringify(filter));
			const items: ItemsDTO[] = await this.itemsDAO.getBySearch(
				filter,
				limit,
				offset
			);
			//console.log("items",items);
			const resultBody = [];
			for (const val of items) {
				// console.log("search##val", val);

				// let category:any = await this.categoryDAO.find({ name: val.category });
				// let brand:any = await this.brandDAO.find({ name: val.brand });

				/*const newImages = [];
                if (val.images) {
                  for (const don of val.images) {
                    const filenameL = don.split('?')[0];
                    const filename = filenameL.split('/')[filenameL.split('/').length - 1];
                    const url = await this.readPreSignedUrl(filename);
                    newImages.push(url);
                  }

                  val.images = newImages;
                }*/

				const r = /\d+/;
				const rT = /\%/;
				const rtO = /\$/;
				const str = val.deal.toString();
				let disCountPrice = val.price;
				if (str) {
					const dealType = str.split(' ')[1];
					const dealPrice = str.split(' ')[0];
					if (dealType === '%') {
						disCountPrice =
							val.price - (val.price * parseInt(dealPrice, 10)) / 100;
					} else if (dealType === 'off') {
						disCountPrice = val.price - parseInt(dealPrice, 10);
					} else {
						disCountPrice = val.price;
					}
				}

				const body: ItemsDTO = JSON.parse(JSON.stringify(val));

				body.disCountPrice = disCountPrice;

				if (
					val.status == 'Active' &&
					val.category.status == 'Active' &&
					val.brand.status == 'Active'
				) {
					resultBody.push(body);
				}
			}
			res.json({ success: true, data: resultBody });
		} catch (err) {
			catchError(err, next);
		}
	};

	public getTopRatedItems = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			let limit = '100';
			let offset = '0';
			if (req.query.limit && req.query.limit !== '') {
				limit = req.query.limit.toString();
			}
			if (req.query.offset && req.query.limit !== '') {
				offset = req.query.offset.toString();
			}
			let pricel = '0';
			let priceu = '999999';
			let pricel2 = '999999';
			let priceu2 = '0';
			const name = req.query.name;
			const brand = req.query.brand;
			const category = req.query.category;
			const rating = req.query.rating;
			const rating_wise = 'true'; //req.query.rating_wise;
			const deal = req.query.deal;
			const dealofday = req.query.dealofday;
			const featured = req.query.featured;
			const userId = req.query.userId;
			let newest = req.query.newest;
			let oldest = req.query.oldest;
			let price_low_to_high = req.query.price_low_to_high;
			let price_high_to_low = req.query.price_high_to_low;

			let reviewCount = 0;

			const filter: any = {};
			if (featured && featured !== '' && featured === 'true') {
				filter.featured = true;
			}
			if (dealofday && dealofday !== '' && dealofday === 'true') {
				filter.dealofDay = true;
			}
			if (name && name !== '') {
				filter.name = { $regex: name, $options: 'i' };
			}
			if (brand && brand !== '') {
				filter.brand = brand;
			}
			if (category && category !== '') {
				filter.category = category;
			}
			if (deal && deal !== '') {
				filter.deal = deal;
			}
			if (req.query.pricel && req.query.pricel !== '') {
				pricel = req.query.pricel.toString();
			}
			if (req.query.priceu && req.query.priceu !== '') {
				priceu = req.query.priceu.toString();
			}
			//filter.price = { $gte: parseInt(priceu2.toString(), 10), $lte:  parseInt(pricel2.toString(), 10) };
			filter.price = {
				$gte: parseInt(pricel.toString(), 10),
				$lte: parseInt(priceu.toString(), 10),
			};
			if (rating && rating !== '') {
				filter.rating = { $gte: parseInt(rating.toString(), 10) };
			}

			const items: ItemsDTO[] = await this.itemsDAO.getByFilter(
				filter,
				limit,
				offset
			);
			const resultBody = [];
			for (const val of items) {
				const r = /\d+/;
				const rT = /\%/;
				const rtO = /\$/;
				const str = val.deal.toString();
				let disCountPrice = val.price;
				if (str) {
					const dealType = str.split(' ')[1];
					const dealPrice = str.split(' ')[0];
					if (dealType === '%') {
						disCountPrice =
							val.price - (val.price * parseInt(dealPrice, 10)) / 100;
					} else if (dealType === 'off') {
						disCountPrice = val.price - parseInt(dealPrice, 10);
					} else {
						disCountPrice = val.price;
					}
				}
				const favItems = await this.favouriteDAO.getByItemId(val._id);
				const favByUser = await this.favouriteDAO.getByItemUserId(
					val._id,
					userId ? userId.toString() : ''
				);

				// console.log("val######toprated", val);

				// let category:any = await this.categoryDAO.find({ name: val.category });
				// let brand:any = await this.brandDAO.find({ name: val.brand });

				const body: ItemsDTO = JSON.parse(JSON.stringify(val));

				body.disCountPrice = disCountPrice;
				body.favouriteByUser = false;
				body.favouriteCout = 0;
				body.newProduct = false;
				if (!favItems) {
					const timeDiff = Math.abs(
						new Date().getTime() - val.added.at.getTime()
					);
					const differentDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
					if (differentDays < 30) {
						body.newProduct = true;
					}
					//resultBody.sort((a,b) =>  new Date(val.added.at.getTime()) - new Date(val.added.at.getTime()));

					if (
						val.status == 'Active' &&
						val.category.status == 'Active' &&
						val.brand.status == 'Active'
					) {
						if (val.reviews.length > 0) {
							reviewCount += val.reviews.length;
						}
						resultBody.push(body);
					}
				} else {
					body.favouriteCout = favItems.length;

					if (!favByUser) {
						const timeDiff = Math.abs(
							new Date().getTime() - val.added.at.getTime()
						);
						const differentDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
						if (differentDays < 30) {
							body.newProduct = true;
						}

						if (
							val.status == 'Active' &&
							val.category.status == 'Active' &&
							val.brand.status == 'Active'
						) {
							if (val.reviews.length > 0) {
								reviewCount += val.reviews.length;
							}
							resultBody.push(body);
						}
					} else {
						body.favouriteByUser = true;
						const timeDiff = Math.abs(
							new Date().getTime() - val.added.at.getTime()
						);
						const differentDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
						if (differentDays < 30) {
							body.newProduct = true;
						}

						if (
							val.status == 'Active' &&
							val.category.status == 'Active' &&
							val.brand.status == 'Active'
						) {
							if (val.reviews.length > 0) {
								reviewCount += val.reviews.length;
							}
							resultBody.push(body);
						}
					}
				}
			}

			if (price_low_to_high == 'true') {
				resultBody.sort((a, b) => a.price - b.price);
			}
			if (price_high_to_low == 'true') {
				resultBody.sort((a, b) => b.price - a.price);
			}
			if (newest == 'true') {
				resultBody.sort(
					(y, x) => +new Date(x.added.at) - +new Date(y.added.at)
				);
			}
			if (oldest == 'true') {
				resultBody.sort(
					(y, x) => +new Date(y.added.at) - +new Date(x.added.at)
				);
			}
			if (rating_wise == 'true') {
				resultBody.sort((a, b) => b.rating - a.rating);
			}

			if (reviewCount > 0) {
				res.json({ success: true, data: resultBody });
			} else {
				res.json({ success: true, data: [] });
			}
		} catch (err) {
			catchError(err, next);
		}
	};

	public getDealItems = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			let limit = '100';
			let offset = '0';
			let dealId;
			let userId;

			let filter;
			if (req.query.limit && req.query.limit !== '') {
				limit = req.query.limit.toString();
			}
			if (req.query.offset && req.query.limit !== '') {
				offset = req.query.offset.toString();
			}
			if (req.query.dealid) {
				dealId = req.query.dealid;
			}
			if (req.query.userId) {
				userId = req.query.userId;
			}

			console.log('dealId', dealId);
			//dealId isn't in param
			if (!dealId) {
				filter = [
					{
						$match: {
							status: 'Active',
						},
					},
					{
						$unwind: '$items',
					},
					{
						$replaceRoot: {
							newRoot: '$items',
						},
					},
					{
						$lookup: {
							from: 'items',
							localField: '_id',
							foreignField: '_id',
							as: 'product',
						},
					},
					{
						$unwind: {
							path: '$product',
						},
					},
					{
						$addFields: {
							categoryId: {
								$toObjectId: '$product.category._id',
							},
						},
					},
					{
						$addFields: {
							brandId: {
								$toObjectId: '$product.brand._id',
							},
						},
					},
					{
						$lookup: {
							from: 'categories',
							localField: 'categoryId',
							foreignField: '_id',
							as: 'category',
						},
					},
					{
						$unwind: {
							path: '$category',
						},
					},
					{
						$lookup: {
							from: 'brands',
							localField: 'brandId',
							foreignField: '_id',
							as: 'brand',
						},
					},
					{
						$unwind: {
							path: '$brand',
						},
					},
				];
			} else {
				console.log('has deal id');
				// filter = [{
				//   $match: {
				//     _id: new ObjectID(dealId as string),
				//     status: "Active"
				//     }
				//   }, {
				//   $unwind: '$items'
				//   }, {
				//   $replaceRoot: {
				//     newRoot: '$items'
				//     }
				//   }, {
				//   $lookup: {
				//     from: 'items',
				//     localField: '_id',
				//     foreignField: '_id',
				//     as: 'product'
				//     }
				//   }, {
				//   $unwind: {
				//     path: '$product'
				//     }
				//   }, {
				//   $lookup: {
				//     from: 'categories',
				//     localField: 'product.category',
				//     foreignField: 'name',
				//     as: 'category_obj'
				//     }
				//   }, {
				//   $unwind: {
				//     path: '$category_obj'
				//     }
				//   }, {
				//   $lookup: {
				//     from: 'brands',
				//     localField: 'product.brand',
				//     foreignField: 'name',
				//     as: 'brand_obj'
				//     }
				//   }, {
				//   $unwind: {
				//     path: '$brand_obj'
				//   }
				//   }];

				filter = [
					{
						$match: {
							_id: new ObjectID(dealId as string),
							status: 'Active',
						},
					},
					{
						$unwind: '$items',
					},
					{
						$replaceRoot: {
							newRoot: '$items',
						},
					},
					{
						$lookup: {
							from: 'items',
							localField: '_id',
							foreignField: '_id',
							as: 'product',
						},
					},
					{
						$unwind: {
							path: '$product',
						},
					},
					{
						$addFields: {
							categoryId: {
								$toObjectId: '$product.category._id',
							},
						},
					},
					{
						$addFields: {
							brandId: {
								$toObjectId: '$product.brand._id',
							},
						},
					},
					{
						$lookup: {
							from: 'categories',
							localField: 'categoryId',
							foreignField: '_id',
							as: 'category',
						},
					},
					{
						$unwind: {
							path: '$category',
						},
					},
					{
						$lookup: {
							from: 'brands',
							localField: 'brandId',
							foreignField: '_id',
							as: 'brand',
						},
					},
					{
						$unwind: {
							path: '$brand',
						},
					},
				];
			}

			// filter.deal = {"deal":{"$ne":null}};

			const items: ItemsDTO[] = await this.itemsDAO.getByFilterDeal(
				filter,
				limit,
				offset
			);
			const resultBody = [];

			console.log('###items.length', items.length, JSON.stringify(filter));
			for (const val of items) {
				// console.log("###val##Deals", val);

				let favByUser = await this.favouriteDAO.getByItemUserId(
					val._id,
					userId as string
				);

				// let category = await this.categoryDAO.find({ name: val.category });
				// let brand = await this.brandDAO.find({ name: val.brand });

				// console.log("favByUser### val._id , userId, favByUser ",val._id , userId, favByUser)

				// const newImages = [];
				// if (val.product.images) {
				//   for (const don of val.product.images) {
				//     const filenameL = don.split('?')[0];
				//     const filename = filenameL.split('/')[filenameL.split('/').length - 1];
				//     const url = await this.readPreSignedUrl(filename);
				//     newImages.push(url);
				//   }
				// }
				//
				// val.product.images = newImages;

				const r = /\d+/;
				const rT = /\%/;
				const rtO = /\$/;
				const str = val.product.deal.toString();
				let disCountPrice = val.product.price;
				if (str) {
					const dealType = str.split(' ')[1];
					const dealPrice = str.split(' ')[0];
					if (dealType === '%') {
						disCountPrice =
							val.product.price -
							(val.product.price * parseInt(dealPrice, 10)) / 100;
					} else if (dealType === 'off') {
						disCountPrice = val.product.price - parseInt(dealPrice, 10);
					} else {
						disCountPrice = val.product.price;
					}
				}

				const body: ItemsDTO = JSON.parse(JSON.stringify(val.product));

				body.disCountPrice = disCountPrice;
				const data = await this.reviewDAO.getByProductId(val.product._id);
				let ratingTotal;
				if (!data) {
					ratingTotal = 0;
					//body.rating = ratingTotal;
				} else {
					let total = 0;
					for (let i = 0; i < data.length; i++) {
						total += parseInt(data[i].rating);
					}
					ratingTotal = total / data.length;
					body.rating = ratingTotal;
				}

				const favourite = await this.favouriteDAO.getByItemUserId(
					val._id,
					req.query.userId as string
				);

				// console.log("####favourite", favourite);

				body.favouriteByUser =
					favourite != null && Object.keys(favourite).length > 0;

				console.log(
					"val.status == 'Active', val.category.status == 'Active', val.brand.status == 'Active'",
					val.status == 'Active',
					val.category.status == 'Active',
					val.brand.status == 'Active'
				);

				if (
					val.product.status == 'Active' &&
					val.category.status == 'Active' &&
					val.brand.status == 'Active'
				) {
					resultBody.push(body);
				}
			}

			res.json({ success: true, data: resultBody });
		} catch (err) {
			catchError(err, next);
		}
	};
	public getItemsRange = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const items: ItemsDTO[] = await this.itemsDAO.getByFilterRange();
			const resultBody = [];
			//const maxPrice=items[0].price;
			resultBody.push(items);

			res.json({ success: true, data: items });
		} catch (err) {
			catchError(err, next);
		}
	};

	public getFavouriteItems = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			let limit = '100';
			let offset = '0';
			if (req.query.limit && req.query.limit !== '') {
				limit = req.query.limit.toString();
			}
			if (req.query.offset && req.query.limit !== '') {
				offset = req.query.offset.toString();
			}
			let uid = '';
			if (req.query.userId && req.query.userId !== '') {
				uid = req.query.userId.toString();
			}
			const userData = await this.userDAO.getById(uid);
			if (!userData) {
				throw new HandledApplicationError(417, 'invalid user id');
			} else {
				const favItems = await this.favouriteDAO.getByUserId(userData._id);
				const list: any = [];
				for (const val of favItems) {
					list.push(new ObjectId(val.itemIds));
				}
				const filter: any = { _id: { $in: list } };
				const items: any = await this.itemsDAO.getByFilter(
					filter,
					limit,
					offset
				);
				const resultBody: ItemsDTO[] = [];
				for (const val of items) {
					// console.log('va####fav',val);

					// let category = await this.categoryDAO.find({ name: val.category });
					// let brand = await this.brandDAO.find({ name: val.brand });

					// const newImages = [];
					// for (const don of val.images) {
					//   const filenameL = don.split('?')[0];
					//   const filename = filenameL.split('/')[filenameL.split('/').length - 1];
					//   const url = await this.readPreSignedUrl(filename);
					//   newImages.push(url);
					// }
					// val.images = newImages;
					const body: ItemsDTO = val;
					if (
						val.status == 'Active' &&
						val.category.status == 'Active' &&
						val.brand.status == 'Active'
					) {
						resultBody.push(body);
					}
				}
				res.json({ success: true, data: resultBody });
			}
		} catch (err) {
			catchError(err, next);
		}
	};

	public setFavouriteItems = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const dto: FavouriteDTO = req.body;
			const favItems = await this.favouriteDAO.getByItemUserId(
				dto.itemIds,
				dto.userId
			);
			if (!favItems) {
				const result = await this.favouriteDAO.create(dto);
				res.json({ success: true, status: 'added' });
			} else {
				const result = await this.favouriteDAO.update(dto.itemIds, dto.userId);
				res.json({ success: true, status: 'removed' });
			}
		} catch (err) {
			catchError(err, next);
		}
	};

	public getByItemsId = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			let userId = '';
			if (req.query.userId && req.query.userId !== '') {
				userId = req.query.userId.toString();
			}

			//if logged in user
			if (userId !== '') {
				let result: any = await this.itemsDAO.getItemById(id);
				result = result[0];
				const favItems = await this.favouriteDAO.getByItemUserId(
					result._id,
					userId
				);
				let favByUser = false;
				if (favItems) {
					favByUser = true;
				}

				console.log('##user is logged in', result.deal);
				// const newImages = [];
				// for (const don of result.images) {
				//   const filenameL = don.split('?')[0];
				//   const filename = filenameL.split('/')[filenameL.split('/').length - 1];
				//   const url = await this.readPreSignedUrl(filename);
				//   newImages.push(url);
				// }
				// result.images = newImages;
				const r = /\d+/;
				const rT = /\%/;
				const rtO = /\$/;
				const str = result.deal.toString();
				let disCountPrice = result.price;
				if (str) {
					const dealType = str.split(' ')[1];
					const dealPrice = str.split(' ')[0];
					if (dealType === '%') {
						disCountPrice =
							result.price - (result.price * parseInt(dealPrice, 10)) / 100;
					} else if (dealType === 'off') {
						disCountPrice = result.price - parseInt(dealPrice, 10);
					} else {
						disCountPrice = result.price;
					}
				}
				/* const valueOfDiscount = str.match(r);
                 const typeOfDiscount1 = str.match(rT);
                 const typeOfDiscount2 = str.match(rtO);
                 let disCountPrice = result.price;
                 if (typeOfDiscount1) {
                   disCountPrice = result.price - (result.price * parseInt(valueOfDiscount[0], 10) / 100);
                 } else if (typeOfDiscount2) {
                   disCountPrice = result.price - parseInt(valueOfDiscount[0], 10);
                 } else {
                   disCountPrice = result.price;
                 }*/
				const cart = await this.cartDao.getCartByUserId(userId);
				let quantityincart = 0;
				if (result && cart && cart.items.length > 0) {
					for (const i of cart.items) {
						if (i.itemId === result._id.toString()) {
							quantityincart = i.quantity;
							break;
						}
					}
				}
				res.json({
					success: true,
					result,
					quantityincart,
					favByUser,
					disCountPrice,
				});
			} else {
				let result: any = await this.itemsDAO.getItemById(id);
				result = result[0];
				// const newImages = [];
				// for (const don of result.images) {
				//   const filenameL = don.split('?')[0];
				//   const filename = filenameL.split('/')[filenameL.split('/').length - 1];
				//   const url = await this.readPreSignedUrl(filename);
				//   newImages.push(url);
				// }
				// result.images = newImages;
				const r = /\d+/;
				const rT = /\%/;
				const rtO = /\$/;
				const str = result?.deal?.toString();
				let disCountPrice = result.price;
				if (str) {
					const dealType = str.split(' ')[1];
					const dealPrice = str.split(' ')[0];
					if (dealType === '%') {
						disCountPrice =
							result.price - (result.price * parseInt(dealPrice, 10)) / 100;
					} else if (dealType === 'off') {
						disCountPrice = result.price - parseInt(dealPrice, 10);
					} else {
						disCountPrice = result.price;
					}
				}
				/*const valueOfDiscount = str.match(r);
                const typeOfDiscount1 = str.match(rT);
                const typeOfDiscount2 = str.match(rtO);
                let disCountPrice = result.price;
                if (typeOfDiscount1) {
                  disCountPrice = result.price - (result.price * parseInt(valueOfDiscount[0], 10) / 100);
                } else if (typeOfDiscount2) {
                  disCountPrice = result.price - parseInt(valueOfDiscount[0], 10);
                } else {
                  disCountPrice = result.price;
                }*/
				const quantityincart = 0;
				res.json({
					success: true,
					result,
					quantityincart,
					favByUser: false,
					disCountPrice,
				});
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

	public getItemsFilter = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			let limit = '100';
			let offset = '0';
			const filter: any = {};
			const brand = req.query.brand;
			const category = req.query.category;
			let price_low_to_high = true;

			if (category && category !== '') {
				filter.category = category;
			}
			if (brand && brand !== '') {
				filter.brand = brand;
			}
			const items: ItemsDTO[] = await this.itemsDAO.getByFilter(
				filter,
				limit,
				offset
			);
			const resultBody = [];
			const brands = [];
			const category2 = [];
			const features = [];
			const discount = [];
			for (const val of items) {
				if (brands.indexOf(val.brand) == -1) {
					brands.push(val.brand);
				}
				if (category == null) {
					if (category2.indexOf(val.category) == -1) {
						category2.push(val.category);
					}
				}

				if (features.indexOf(val.keyFeatures[0].title) == -1) {
					features.push(val.keyFeatures[0].title);
				}

				if (discount.indexOf(val.deal.replace(' ', '')) == -1) {
					discount.push(val.deal.replace(' ', ''));
				}
			}

			//let total_length = items.length;

			if (category == null) {
				const finalArry = [
					{ title: 'Price Range', lower_price: 25.0, upper_price: 25000 },
					{ type: 'List', title: 'Category', items: category2 },
					{ type: 'List', title: 'Brands', items: brands },
					{ type: 'List', title: 'Discount Percent', items: discount },
					{ type: 'List', title: 'Features', items: features },
				];
				res.json(finalArry);
			} else {
				const finalArry = [
					{ title: 'Price Range', lower_price: 25.0, upper_price: 25000 },
					{ type: 'List', title: 'Brands', items: brands },
					{ type: 'List', title: 'Discount Percent', items: discount },
					{ type: 'List', title: 'Features', items: features },
				];
				res.json(finalArry);
			}
		} catch (err) {
			catchError(err, next);
		}
	};

	public importItemsFromCSV = async (
		req2: IAuthenticatedRequest,
		res2: express.Response,
		next: express.NextFunction
	) => {
		try {
			const uploadFile = require('../middleware/upload');
			//const baseUrl = "ocalhost:8080/files/";

			const upload = async (req: any, res: any) => {
				try {
					await uploadFile(req, res);

					if (req.file == undefined) {
						return res.status(400).send({ message: 'Please upload a file!' });
					}

					res.status(200).send({
						message: 'Uploaded the file successfully: ' + req.file.originalname,
					});
				} catch (err) {
					console.log(err);

					if (err.code == 'LIMIT_FILE_SIZE') {
						return res.status(500).send({
							message: 'File size cannot be larger than 2MB!',
						});
					}

					res.status(500).send({
						message: `Could not upload the file: ${req.file.originalname}. ${err}`,
					});
				}
			};
			/*
            const getListFiles = (req, res) => {
              const directoryPath = __basedir + "/resources/static/assets/uploads/";

              fs.readdir(directoryPath, function (err, files) {
                if (err) {
                  res.status(500).send({
                    message: "Unable to scan files!",
                  });
                }

                let fileInfos = [];

                files.forEach((file) => {
                  fileInfos.push({
                    name: file,
                    url: baseUrl + file,
                  });
                });

                res.status(200).send(fileInfos);
              });
            };

            const download = (req, res) => {
              const fileName = req.params.name;
              const directoryPath = __basedir + "/resources/static/assets/uploads/";

              res.download(directoryPath + fileName, fileName, (err) => {
                if (err) {
                  res.status(500).send({
                    message: "Could not download the file. " + err,
                  });
                }
              });
            };

            module.exports = {
              upload,
              getListFiles,
              download,
            }; */
			/*
            const csvtojson = require("csvtojson");
            const csvfilepath = await this.readPreSignedUrl('https://storage.googleapis.com/mbebucket/dummy-file.csv');//"https://storage.googleapis.com/mbebucket/dummy-file.csv";
            csvtojson()
            .fromFile(csvfilepath)
            .then((json:any)=>{
              //console.log(json);
              res.json(json);
            })
            */
		} catch (err) {
			catchError(err, next);
		}
	};
}
