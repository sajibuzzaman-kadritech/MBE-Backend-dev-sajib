import config from 'config';
import express from 'express';
import DealsDAO from '../../daos/deals.dao';
import DealsDTO from '../../dtos/deals.dto';
import CategoryDAO from '../../daos/category.dao';
import ItemsDAO from '../../daos/items.dao';
import ItemsDTO from '../../dtos/items.dto';
import catchError from '../../error/catch-error';
import HandledApplicationError from '../../error/handled-application-error';
import IAuthenticatedRequest from '../../guards/authenticated.request';
import { itemsModel } from '../../models/items.schema';
import { ObjectId } from 'bson';
import BrandsDAO from '../../daos/brands.dao';
import moment from 'moment';
import BrandsDTO from 'src/dtos/brands.dto';
import CategoryDTO from 'src/dtos/category.dto';
const items_schema_1 = require('../../models/items.schema');
const deals_schema_1 = require('../../models/deals.schema');

export class AdminItems {
	private readonly itemsDAO: ItemsDAO;
	private readonly dealsDAO: DealsDAO;
	private readonly categoryDAO: CategoryDAO;
	private readonly brandDAO: BrandsDAO;

	constructor() {
		this.itemsDAO = new ItemsDAO();
		this.dealsDAO = new DealsDAO();
		this.categoryDAO = new CategoryDAO();
		this.brandDAO = new BrandsDAO();
	}

	public changeItemStatus = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const status = req.body.status;
			const result = await this.itemsDAO.changeStatus(id, status);
			res.json(result);
		} catch (err) {
			catchError(err, next);
		}
	};

	public getAllItems = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const result = await this.itemsDAO.getAllItems();

			const resultbody = [];

			for (const con of result) {
				if (con.category.status == 'Active' && con.brand.status == 'Active') {
					resultbody.push(con);
				}
			}

			res.json(resultbody);
		} catch (err) {
			catchError(err, next);
		}
	};

	public addItem = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const itemDto: ItemsDTO = req.body;
			const deal: DealsDTO = req.body.deal;
			itemDto.deal = deal.name;
			const currentTime = moment().toISOString();
			itemDto.added = {
				// @ts-ignore
				at: currentTime,
			};
			const result = await this.itemsDAO.create(itemDto);
			if (deal._id !== null) {
				const getDealByID: DealsDTO = await this.dealsDAO.getById(deal._id);
				getDealByID.items.push(result);
				const updatedDeal = await this.dealsDAO.update(deal._id, getDealByID);
			}
			res.json({ success: true, status: 'success' });
		} catch (err) {
			catchError(err, next);
		}
	};
	public addExportItem = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			let list = req.body;
			const brands = await this.brandDAO.getAllBrands();
			const categories = await this.categoryDAO.getAllCategories();
			const deals = await this.dealsDAO.getAllDeals();

			// @ts-ignore
			list?.forEach((element) => {
				// console.log(element);
				element.brand = brands.find((brand) => brand.name === element.brand);
				element.category = categories.find(
					(category) => category.name === element.category
				);
				let deal;
				if (element.deal) {
					deal = deals.find((deal) => deal.name === element.deal);
				} else {
					deal = { _id: null, status: 'Not Active', name: 'none' };
				}
				element.deal = deal.name;

				const currentTime = moment().toISOString();
				element.added = {
					// @ts-ignore
					at: currentTime,
				};
			});

			let promise = new Promise(async function (resolve, reject) {
				const result = await items_schema_1.itemsModel.insertMany(list);
				if (result) {
					return resolve(result);
				}
			});

			promise.then(function (result) {
				// console.log(result);
				// @ts-ignore
				result?.forEach(async (element) => {
					if (element.deal !== 'none') {
						const getDeal = deals.find((deal) => deal.name === element.deal);
						getDeal.items.push(element);
						await deals_schema_1.dealsModel.findByIdAndUpdate(
							getDeal._id,
							getDeal
						);
					}
				});
			});

			res.json({ success: true, status: 'success' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public updateItems = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const itemData: ItemsDTO = req.body;
			let deal;
			if (req.body.deal) {
				deal = req.body.deal;
				itemData.deal = req.body.deal.name;
			}
			const currentTime = moment().toISOString();
			itemData.updated = {
				// @ts-ignore
				at: currentTime,
			};

			const result = await this.itemsDAO.update(id, itemData);
			let updatedDeal;

			//adding to items array
			if (req.body.deal) {
				if (deal._id != null || deal._id != undefined) {
					const getDealByID: DealsDTO = await this.dealsDAO.getById(deal._id);
					// if items is empty
					if (!(getDealByID.items.length > 0)) {
						getDealByID.items = [];
						getDealByID.items.push({ _id: result._id });

						const getDealByProductId: any = await this.dealsDAO.find({
							'items._id': new ObjectId(id),
						});

						if (getDealByProductId.length > 0) {
							let filteredItems = getDealByProductId[0].items.filter(
								(obj: any, index: number) => {
									console.log('obj._id != id', obj._id != id);
									if (obj._id != id) {
										return obj;
									}
								}
							);

							let cDeal = getDealByProductId[0];

							cDeal.items = filteredItems;

							let removedProduct = await this.dealsDAO.update(
								getDealByProductId[0]._id,
								cDeal
							);
						}
						updatedDeal = await this.dealsDAO.update(deal._id, getDealByID);
					} else {
						const getDealByProductId: any = await this.dealsDAO.find({
							'items._id': new ObjectId(id),
						});

						if (getDealByProductId.length > 0) {
							let filteredItems = getDealByProductId[0].items.filter(
								(obj: any, index: number) => {
									console.log('obj._id != id', obj._id != id);
									if (obj._id != id) {
										return obj;
									}
								}
							);

							let cDeal = getDealByProductId[0];

							cDeal.items = filteredItems;

							let removedProduct = await this.dealsDAO.update(
								getDealByProductId[0]._id,
								cDeal
							);
						}

						getDealByID.items.push({ _id: new ObjectId(id) });

						updatedDeal = await this.dealsDAO.update(deal._id, getDealByID);
					}

					//removing from items array
				} else {
					const getRelatedDeal: any = await this.dealsDAO.find({
						'items._id': new ObjectId(id),
					});

					if (getRelatedDeal.length > 0) {
						if (getRelatedDeal[0].items.length > 0) {
							// console.log("getRelatedDeal[0].items",getRelatedDeal[0].items);
							let filteredItems = getRelatedDeal[0].items.filter((obj: any) => {
								// console.log(obj._id, id, obj._id != id);
								if (obj._id != id) {
									return obj;
								}
							});

							getRelatedDeal[0].items = filteredItems;

							const updatedDeal = await this.dealsDAO.update(
								getRelatedDeal[0]._id,
								getRelatedDeal[0]
							);
						}
					}
				}
			}

			res.json({ success: true, status: 'success' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public deleteItem = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const result = await this.itemsDAO.deleteItem(id);
			res.json({ success: true, status: 'success' });
		} catch (err) {
			catchError(err, next);
		}
	};
	public relistItem = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const id = req.params.id;
			const result = await this.itemsDAO.relistItem(id);
			res.json({ success: true, status: 'success' });
		} catch (err) {
			catchError(err, next);
		}
	};

	public getDeletedItems = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const brand = req.params.name;
			const result = await this.itemsDAO.getDeletedItems();
			res.json({ result });
		} catch (err) {
			catchError(err, next);
		}
	};

	public getItemsAdmin = async (
		req: IAuthenticatedRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const limit = req.query.limit;
			const offset = req.query.offset;
			const search = req.query.name;
			const filter: any = { deleted: false };
			if (search !== undefined && search.length > 0) {
				filter.name = { $regex: search, $options: 'i' };
			}
			const items = await this.itemsDAO.filterItems(filter, limit, offset);
			const countTotal = await itemsModel.countDocuments(filter);
			res.json({ items, countTotal });
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
