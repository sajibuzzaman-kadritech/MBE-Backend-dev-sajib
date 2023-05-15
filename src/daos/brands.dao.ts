import mongoose from 'mongoose';
import BrandsDTO from '../dtos/brands.dto';
import { brandsModel } from '../models/brands.schema';

export default class BrandsDAO {
	public async create(dto: BrandsDTO): Promise<BrandsDTO> {
		const createDTO = new brandsModel(dto);
		return await createDTO.save();
	}
	public async getActiveBrands(): Promise<BrandsDTO[]> {
		return await brandsModel.find({ status: 'Active', delete: false }).exec();
	}
	public async getAllBrands(): Promise<BrandsDTO[]> {
		return await brandsModel.find({ delete: false }).exec();
	}
	public async find(filter: any): Promise<BrandsDTO[]> {
		return await brandsModel.find(filter).exec();
	}
	public async getById(id: string): Promise<BrandsDTO> {
		return await brandsModel.findById(id).exec();
	}
	public async getByName(name: string): Promise<BrandsDTO> {
		return await brandsModel.findOne({ name: name }).exec();
	}
	public async update(id: string, dto: BrandsDTO): Promise<BrandsDTO> {
		const updateDTO = await brandsModel.findById(id).exec();
		Object.assign(updateDTO, dto);
		return await updateDTO.save();
	}
	public async delete(id: string) {
		return brandsModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) });
	}
	public async statusChange(id: string, params: any) {
		if (params.status === 'Active') {
			return brandsModel.findOneAndUpdate(
				{ _id: mongoose.Types.ObjectId(id) },
				{ status: 'Not Active' }
			);
		}
		return brandsModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ status: 'Active' }
		);
	}
}
