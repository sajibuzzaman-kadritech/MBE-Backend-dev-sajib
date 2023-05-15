'use strict';
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
exports.AdminItems = void 0;
const config_1 = __importDefault(require('config'));
const deals_dao_1 = __importDefault(require('../../daos/deals.dao'));
const category_dao_1 = __importDefault(require('../../daos/category.dao'));
const items_dao_1 = __importDefault(require('../../daos/items.dao'));
const catch_error_1 = __importDefault(require('../../error/catch-error'));
const items_schema_1 = require('../../models/items.schema');
const deals_schema_1 = require('../../models/deals.schema');
const bson_1 = require('bson');
const brands_dao_1 = __importDefault(require('../../daos/brands.dao'));
const moment_1 = __importDefault(require('moment'));

class AdminItems {
	constructor() {
		this.changeItemStatus = (req, res, next) =>
			__awaiter(this, void 0, void 0, function* () {
				try {
					const id = req.params.id;
					const status = req.body.status;
					const result = yield this.itemsDAO.changeStatus(id, status);
					res.json(result);
				} catch (err) {
					(0, catch_error_1.default)(err, next);
				}
			});
		this.getAllItems = (req, res, next) =>
			__awaiter(this, void 0, void 0, function* () {
				try {
					const result = yield this.itemsDAO.getAllItems();
					const resultbody = [];
					for (const con of result) {
						if (
							con.category.status == 'Active' &&
							con.brand.status == 'Active'
						) {
							resultbody.push(con);
						}
					}
					res.json(resultbody);
				} catch (err) {
					(0, catch_error_1.default)(err, next);
				}
			});
		this.addItem = (req, res, next) =>
			__awaiter(this, void 0, void 0, function* () {
				try {
					// console.log(req.body)
					const itemDto = req.body;
					const deal = req.body.deal;
					itemDto.deal = deal.name;
					const currentTime = (0, moment_1.default)().toISOString();
					itemDto.added = {
						// @ts-ignore
						at: currentTime,
					};
					const result = yield this.itemsDAO.create(itemDto);
					// console.log(result);
					if (deal._id !== null) {
						const getDealByID = yield this.dealsDAO.getById(deal._id);
						getDealByID.items.push(result);
						const updatedDeal = yield this.dealsDAO.update(
							deal._id,
							getDealByID
						);
					}
					res.json({ success: true, status: 'success' });
				} catch (err) {
					(0, catch_error_1.default)(err, next);
				}
			});
		this.addExportItem = (req, res, next) =>
			__awaiter(this, void 0, void 0, function* () {
				try {
					// console.log(req.body);
					let list = req.body;
					const brands = yield this.brandDAO.getAllBrands();
					const categories = yield this.categoryDAO.getAllCategories();
					const deals = yield this.dealsDAO.getAllDeals();

					list?.forEach((element) => {
						// console.log(element);
						element.brand = brands.find(
							(brand) => brand.name === element.brand
						);
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

						const currentTime = (0, moment_1.default)().toISOString();
						element.added = {
							// @ts-ignore
							at: currentTime,
						};
					});

					// console.log(list);

					let promise = new Promise(async function (resolve, reject) {
						const result = await items_schema_1.itemsModel.insertMany(list);
						if (result) {
							return resolve(result);
						}
					});

					promise.then(function (result) {
						// console.log(result);
						result?.forEach(async (element) => {
							if (element.deal !== 'none') {
								const getDeal = deals.find(
									(deal) => deal.name === element.deal
								);
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
					(0, catch_error_1.default)(err, next);
				}
			});
		this.updateItems = (req, res, next) =>
			__awaiter(this, void 0, void 0, function* () {
				try {
					const id = req.params.id;
					const itemData = req.body;
					let deal;
					if (req.body.deal) {
						deal = req.body.deal;
						itemData.deal = req.body.deal.name;
					}
					const currentTime = (0, moment_1.default)().toISOString();
					itemData.updated = {
						// @ts-ignore
						at: currentTime,
					};
					const result = yield this.itemsDAO.update(id, itemData);
					let updatedDeal;
					//adding to items array
					if (req.body.deal) {
						if (deal._id != null || deal._id != undefined) {
							const getDealByID = yield this.dealsDAO.getById(deal._id);
							// if items is empty
							if (!(getDealByID.items.length > 0)) {
								getDealByID.items = [];
								getDealByID.items.push({ _id: result._id });
								const getDealByProductId = yield this.dealsDAO.find({
									'items._id': new bson_1.ObjectId(id),
								});
								if (getDealByProductId.length > 0) {
									let filteredItems = getDealByProductId[0].items.filter(
										(obj, index) => {
											console.log('obj._id != id', obj._id != id);
											if (obj._id != id) {
												return obj;
											}
										}
									);
									let cDeal = getDealByProductId[0];
									cDeal.items = filteredItems;
									let removedProduct = yield this.dealsDAO.update(
										getDealByProductId[0]._id,
										cDeal
									);
								}
								updatedDeal = yield this.dealsDAO.update(deal._id, getDealByID);
							} else {
								const getDealByProductId = yield this.dealsDAO.find({
									'items._id': new bson_1.ObjectId(id),
								});
								if (getDealByProductId.length > 0) {
									let filteredItems = getDealByProductId[0].items.filter(
										(obj, index) => {
											console.log('obj._id != id', obj._id != id);
											if (obj._id != id) {
												return obj;
											}
										}
									);
									let cDeal = getDealByProductId[0];
									cDeal.items = filteredItems;
									let removedProduct = yield this.dealsDAO.update(
										getDealByProductId[0]._id,
										cDeal
									);
								}
								getDealByID.items.push({ _id: new bson_1.ObjectId(id) });
								updatedDeal = yield this.dealsDAO.update(deal._id, getDealByID);
							}
							//removing from items array
						} else {
							const getRelatedDeal = yield this.dealsDAO.find({
								'items._id': new bson_1.ObjectId(id),
							});
							if (getRelatedDeal.length > 0) {
								if (getRelatedDeal[0].items.length > 0) {
									// console.log("getRelatedDeal[0].items",getRelatedDeal[0].items);
									let filteredItems = getRelatedDeal[0].items.filter((obj) => {
										// console.log(obj._id, id, obj._id != id);
										if (obj._id != id) {
											return obj;
										}
									});
									getRelatedDeal[0].items = filteredItems;
									const updatedDeal = yield this.dealsDAO.update(
										getRelatedDeal[0]._id,
										getRelatedDeal[0]
									);
								}
							}
						}
					}
					res.json({ success: true, status: 'success' });
				} catch (err) {
					(0, catch_error_1.default)(err, next);
				}
			});
		this.deleteItem = (req, res, next) =>
			__awaiter(this, void 0, void 0, function* () {
				try {
					const id = req.params.id;
					const result = yield this.itemsDAO.deleteItem(id);
					res.json({ success: true, status: 'success' });
				} catch (err) {
					(0, catch_error_1.default)(err, next);
				}
			});
		this.relistItem = (req, res, next) =>
			__awaiter(this, void 0, void 0, function* () {
				try {
					const id = req.params.id;
					const result = yield this.itemsDAO.relistItem(id);
					res.json({ success: true, status: 'success' });
				} catch (err) {
					(0, catch_error_1.default)(err, next);
				}
			});
		this.getDeletedItems = (req, res, next) =>
			__awaiter(this, void 0, void 0, function* () {
				try {
					const brand = req.params.name;
					const result = yield this.itemsDAO.getDeletedItems();
					res.json({ result });
				} catch (err) {
					(0, catch_error_1.default)(err, next);
				}
			});
		this.getItemsAdmin = (req, res, next) =>
			__awaiter(this, void 0, void 0, function* () {
				try {
					const limit = req.query.limit;
					const offset = req.query.offset;
					const search = req.query.name;
					const filter = { deleted: false };
					if (search !== undefined && search.length > 0) {
						filter.name = { $regex: search, $options: 'i' };
					}
					const items = yield this.itemsDAO.filterItems(filter, limit, offset);
					const countTotal = yield items_schema_1.itemsModel.countDocuments(
						filter
					);
					res.json({ items, countTotal });
				} catch (err) {
					(0, catch_error_1.default)(err, next);
				}
			});
		this.readPreSignedUrl = (fileName) =>
			__awaiter(this, void 0, void 0, function* () {
				try {
					const { Storage } = require('@google-cloud/storage');
					// Creates a client
					const storage = new Storage({
						projectId: config_1.default.get('gcp.projectId'),
						keyFilename: 'for-poc-325210-a7e014fe2cab.json',
					});
					const options = {
						version: 'v4',
						action: 'read',
						expires: Date.now() + 450 * 60 * 1000, // 15 minutes
					};
					const [url] = yield storage
						.bucket(config_1.default.get('gcp.bucket'))
						.file(fileName)
						.getSignedUrl(options);
					return url;
				} catch (err) {
					return '';
				}
			});
		this.itemsDAO = new items_dao_1.default();
		this.dealsDAO = new deals_dao_1.default();
		this.categoryDAO = new category_dao_1.default();
		this.brandDAO = new brands_dao_1.default();
	}
}
exports.AdminItems = AdminItems;
//# sourceMappingURL=authorize-admin.controller.js.map
