import moment from 'moment';
import mongoose from 'mongoose';
import { dealsModel } from '../models/deals.schema';
import ItemsDTO from '../dtos/items.dto';
import { itemsModel } from '../models/items.schema';
import { ObjectId } from 'bson';

export default class ItemsDAO {
	public async create(dto: ItemsDTO): Promise<ItemsDTO> {
		const createDTO = new itemsModel(dto);
		return await createDTO.save();
	}
	public async insertMany(dto: any): Promise<ItemsDTO[]> {
		// @ts-ignore
		return await itemsModel.insertMany(dto);
	}
	public async getItemById(id: string): Promise<ItemsDTO> {
		return await itemsModel
			.aggregate([
				{
					$match: {
						_id: new ObjectId(id),
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
	}
	public async getItemsByIds(ids: string[]): Promise<ItemsDTO[]> {
		return await itemsModel.find({ _id: { $in: ids } }).exec();
	}
	public async getDeletedItems(): Promise<ItemsDTO[]> {
		return await itemsModel.find({ deleted: true }).exec();
	}
	public async getItemsByUserId(id: string): Promise<any> {
		return await itemsModel.find({ userId: id }).exec();
	}
	public async getItemsByCategory(category: string): Promise<ItemsDTO[]> {
		return await itemsModel.find({ category }).exec();
	}
	public async getItemsBySubCategory(subcategory: string): Promise<ItemsDTO[]> {
		return await itemsModel.find({ subcategory }).exec();
	}
	public async getItemsByBrand(brand: string): Promise<ItemsDTO[]> {
		return await itemsModel.find({ brand }).exec();
	}
	public async getAllItems(): Promise<ItemsDTO[]> {
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

		return await itemsModel
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
	}
	public async getDashboardItems(
		fromdate: string,
		todate: string
	): Promise<ItemsDTO[]> {
		console.log(
			moment(fromdate, 'YYYY-M-DD').format(),
			moment(todate, 'YYYY-M-DD').add('1', 'days').format()
		);

		return await itemsModel
			.find({
				'added.at': {
					$gte: moment(fromdate, 'YYYY-M-DD').format(),
					$lt: moment(todate, 'YYYY-M-DD').add('1', 'days').format(),
				},
			})
			.exec();
	}
	public async update(id: string, dto: ItemsDTO): Promise<ItemsDTO> {
		const updateDTO = await itemsModel.findById(id).exec();
		Object.assign(updateDTO, dto);
		return await updateDTO.save();
	}

	public async updateMultiple(
		ids: Array<string>,
		data: object
	): Promise<ItemsDTO> {
		const updateDTO = await itemsModel.updateMany(
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
	}

	public async changeStatus(id: string, status: string) {
		if (status === 'active') {
			return itemsModel.findOneAndUpdate(
				{ _id: mongoose.Types.ObjectId(id) },
				{ status: 'not active' }
			);
		}
		return itemsModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ status: 'active' }
		);
	}

	public async deleteItem(id: string) {
		return itemsModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ status: 'not active' }
		);
	}
	public async relistItem(id: string) {
		return itemsModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ status: 'Active' }
		);
	}
	public async filterItems(filter: any, limit: any, offset: any) {
		const d = new Date().toISOString();
		filter.endDate = { $gte: d };
		return itemsModel
			.find(filter)
			.sort({ _id: -1 })
			.limit(parseInt(limit.toString(), 10))
			.skip(parseInt(offset.toString(), 10));
	}

	public async getByFilter(
		filter: any,
		limit: any,
		offset: any
	): Promise<ItemsDTO[]> {
		let filterTemp: any = [
			{
				$match: { ...filter },
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

		return await itemsModel
			.aggregate(filterTemp)
			.sort({ _id: -1 })
			.limit(parseInt(limit.toString(), 10))
			.skip(parseInt(offset.toString(), 10));
	}
	public async getByFilterDeal(
		filter: any,
		limit: any,
		offset: any
	): Promise<ItemsDTO[]> {
		return await dealsModel
			.aggregate(filter)
			.sort({ _id: -1 })
			.limit(parseInt(limit.toString(), 10))
			.skip(parseInt(offset.toString(), 10));
	}
	public async getByFilterRange(): Promise<ItemsDTO[]> {
		return await itemsModel.aggregate([
			{
				$group: {
					_id: null,
					MaxPrice: { $max: '$price' },
					MinPrice: { $min: '$price' },
				},
			},
		]); //find().sort({ price: -1 }).limit(1);
	}
	public async getBySearch(
		filter: any,
		limit: any,
		offset: any
	): Promise<ItemsDTO[]> {
		let filterTemp: any = [...filter];

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

		return await itemsModel
			.aggregate(filterTemp)
			.sort({ _id: -1 })
			.limit(parseInt(limit.toString(), 10))
			.skip(parseInt(offset.toString(), 10));
	}
}
