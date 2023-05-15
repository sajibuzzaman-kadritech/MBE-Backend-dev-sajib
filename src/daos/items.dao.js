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
const moment_1 = __importDefault(require('moment'));
const mongoose_1 = __importDefault(require('mongoose'));
const deals_schema_1 = require('../models/deals.schema');
const items_schema_1 = require('../models/items.schema');
const bson_1 = require('bson');
class ItemsDAO {
	create(dto) {
		return __awaiter(this, void 0, void 0, function* () {
			const createDTO = new items_schema_1.itemsModel(dto);
			return yield createDTO.save();
		});
	}
	insertMany(dto) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield items_schema_1.itemsModel.insertMany(dto);
		});
	}
	getItemById(id) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield items_schema_1.itemsModel
				.aggregate([
					{
						$match: {
							_id: new bson_1.ObjectId(id),
						},
					},
					{
						$addFields: {
							productId: {
								$toString: '$_id',
							},
						},
					},
					{
						$lookup: {
							from: 'reviews',
							localField: 'productId',
							foreignField: 'productId',
							as: 'reviews',
						},
					},
					{
						$addFields: {
							brandId: {
								$toObjectId: '$brand._id',
							},
						},
					},
					{
						$addFields: {
							categoryId: {
								$toObjectId: '$category._id',
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
					{
						$unwind: {
							path: '$category',
						},
					},
				])
				.exec();
		});
	}
	getItemsByIds(ids) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield items_schema_1.itemsModel.find({ _id: { $in: ids } }).exec();
		});
	}
	getDeletedItems() {
		return __awaiter(this, void 0, void 0, function* () {
			return yield items_schema_1.itemsModel.find({ deleted: true }).exec();
		});
	}
	getItemsByUserId(id) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield items_schema_1.itemsModel.find({ userId: id }).exec();
		});
	}
	getItemsByCategory(category) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield items_schema_1.itemsModel.find({ category }).exec();
		});
	}
	getItemsBySubCategory(subcategory) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield items_schema_1.itemsModel.find({ subcategory }).exec();
		});
	}
	getItemsByBrand(brand) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield items_schema_1.itemsModel.find({ brand }).exec();
		});
	}
	getAllItems() {
		return __awaiter(this, void 0, void 0, function* () {
			// return await itemsModel.aggregate([
			// {
			//   $lookup: {
			//     from: 'categories',
			//     localField: 'category._id',
			//     foreignField: '_id',
			//     as: 'category'
			//   }
			// },
			// {
			//   $unwind: {
			//     path: 'category'
			//   }
			// },
			// {
			//   $lookup: {
			//     from: 'brands',
			//     localField: 'brand',
			//     foreignField: 'name',
			//     as: 'brand_obj'
			//   }
			// },
			// {
			//   $unwind: {
			//     path: '$brand_obj'
			//   }
			// }
			// ]).exec();
			// return await itemsModel.find().exec();
			return yield items_schema_1.itemsModel
				.aggregate([
					{
						$addFields: {
							brandId: {
								$toObjectId: '$brand._id',
							},
						},
					},
					{
						$addFields: {
							categoryId: {
								$toObjectId: '$category._id',
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
					{
						$unwind: {
							path: '$category',
						},
					},
				])
				.exec();
		});
	}
	getDashboardItems(fromdate, todate) {
		return __awaiter(this, void 0, void 0, function* () {
			console.log(
				(0, moment_1.default)(fromdate, 'YYYY-M-DD').format(),
				(0, moment_1.default)(todate, 'YYYY-M-DD').add('1', 'days').format()
			);
			return yield items_schema_1.itemsModel
				.find({
					'added.at': {
						$gte: (0, moment_1.default)(fromdate, 'YYYY-M-DD').format(),
						$lt: (0, moment_1.default)(todate, 'YYYY-M-DD')
							.add('1', 'days')
							.format(),
					},
				})
				.exec();
		});
	}
	update(id, dto) {
		return __awaiter(this, void 0, void 0, function* () {
			const updateDTO = yield items_schema_1.itemsModel.findById(id).exec();
			Object.assign(updateDTO, dto);
			return yield updateDTO.save();
		});
	}
	updateMultiple(ids, data) {
		return __awaiter(this, void 0, void 0, function* () {
			const updateDTO = yield items_schema_1.itemsModel.updateMany(
				{
					_id: {
						$in: ids,
					},
				},
				{
					$set: data,
				}
			);
			return updateDTO;
		});
	}
	changeStatus(id, status) {
		return __awaiter(this, void 0, void 0, function* () {
			if (status === 'active') {
				return items_schema_1.itemsModel.findOneAndUpdate(
					{ _id: mongoose_1.default.Types.ObjectId(id) },
					{ status: 'not active' }
				);
			}
			return items_schema_1.itemsModel.findOneAndUpdate(
				{ _id: mongoose_1.default.Types.ObjectId(id) },
				{ status: 'active' }
			);
		});
	}
	deleteItem(id) {
		return __awaiter(this, void 0, void 0, function* () {
			return items_schema_1.itemsModel.findOneAndUpdate(
				{ _id: mongoose_1.default.Types.ObjectId(id) },
				{ status: 'not active' }
			);
		});
	}
	relistItem(id) {
		return __awaiter(this, void 0, void 0, function* () {
			return items_schema_1.itemsModel.findOneAndUpdate(
				{ _id: mongoose_1.default.Types.ObjectId(id) },
				{ status: 'Active' }
			);
		});
	}
	filterItems(filter, limit, offset) {
		return __awaiter(this, void 0, void 0, function* () {
			const d = new Date().toISOString();
			filter.endDate = { $gte: d };
			return items_schema_1.itemsModel
				.find(filter)
				.sort({ _id: -1 })
				.limit(parseInt(limit.toString(), 10))
				.skip(parseInt(offset.toString(), 10));
		});
	}
	getByFilter(filter, limit, offset) {
		return __awaiter(this, void 0, void 0, function* () {
			let filterTemp = [
				{
					$match: Object.assign({}, filter),
				},
			];
			let temp = [
				{
					$match: {
						status: 'Active',
					},
				},
				{
					$addFields: {
						categoryId: {
							$toObjectId: '$category._id',
						},
					},
				},
				{
					$addFields: {
						brandId: {
							$toObjectId: '$brand._id',
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
				{
					$addFields: {
						productId: {
							$toString: '$_id',
						},
					},
				},
				{
					$lookup: {
						from: 'reviews',
						localField: 'productId',
						foreignField: 'productId',
						as: 'reviews',
					},
				},
			];
			filterTemp = filterTemp.concat(temp);
			console.log('$$filterTemp', JSON.stringify(filterTemp));
			return yield items_schema_1.itemsModel
				.aggregate(filterTemp)
				.sort({ _id: -1 })
				.limit(parseInt(limit.toString(), 10))
				.skip(parseInt(offset.toString(), 10));
		});
	}
	getByFilterDeal(filter, limit, offset) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield deals_schema_1.dealsModel
				.aggregate(filter)
				.sort({ _id: -1 })
				.limit(parseInt(limit.toString(), 10))
				.skip(parseInt(offset.toString(), 10));
		});
	}
	getByFilterRange() {
		return __awaiter(this, void 0, void 0, function* () {
			return yield items_schema_1.itemsModel.aggregate([
				{
					$group: {
						_id: null,
						MaxPrice: { $max: '$price' },
						MinPrice: { $min: '$price' },
					},
				},
			]); //find().sort({ price: -1 }).limit(1);
		});
	}
	getBySearch(filter, limit, offset) {
		return __awaiter(this, void 0, void 0, function* () {
			let filterTemp = [...filter];
			let temp = [
				{
					$match: {
						status: 'Active',
					},
				},
				{
					$addFields: {
						categoryId: {
							$toObjectId: '$category._id',
						},
					},
				},
				{
					$addFields: {
						brandId: {
							$toObjectId: '$brand._id',
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
			filterTemp = filterTemp.concat(temp);
			return yield items_schema_1.itemsModel
				.aggregate(filterTemp)
				.sort({ _id: -1 })
				.limit(parseInt(limit.toString(), 10))
				.skip(parseInt(offset.toString(), 10));
		});
	}
}
exports.default = ItemsDAO;
//# sourceMappingURL=items.dao.js.map
