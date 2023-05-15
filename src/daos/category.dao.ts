import mongoose from 'mongoose';
import CategoryDTO from '../dtos/category.dto';
import { categoryModel } from '../models/category.schema';

export default class CategoryDAO {
	public async create(dto: CategoryDTO): Promise<CategoryDTO> {
		const createDTO = new categoryModel(dto);
		return await createDTO.save();
	}

	public async getAllCategories(): Promise<CategoryDTO[]> {
		return await categoryModel.find({ delete: false }).exec();
	}
	public async getActiveCategories(): Promise<CategoryDTO[]> {
		return await categoryModel.find({ status: 'Active', delete: false }).exec();
	}
	public async find(filter: any): Promise<CategoryDTO[]> {
		return await categoryModel.find(filter).exec();
	}
	public async getById(id: string): Promise<CategoryDTO> {
		return await categoryModel.findById(id).exec();
	}
	public async getByName(name: string): Promise<CategoryDTO> {
		return await categoryModel.findOne({ name: name }).exec();
	}
	public async update(id: string, dto: CategoryDTO): Promise<CategoryDTO> {
		const updateDTO = await categoryModel.findById(id).exec();
		Object.assign(updateDTO, dto);
		return await updateDTO.save();
	}
	public async delete(id: string) {
		return categoryModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ delete: true, status: 'Not Active' }
		);
	}
	public async statusChange(id: string, params: any) {
		if (params.status === 'Active') {
			return categoryModel.findOneAndUpdate(
				{ _id: mongoose.Types.ObjectId(id) },
				{ status: 'Not Active' }
			);
		}
		return categoryModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ status: 'Active' }
		);
	}
}
