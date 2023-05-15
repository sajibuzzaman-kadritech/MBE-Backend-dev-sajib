import moment from 'moment';
import mongoose from 'mongoose';
import { UserDTO, UserGoogleDTO } from '../dtos/user.dto';
import { userModel } from '../models/user.schema';

export default class UserDAO {
	public async create(dto: UserDTO): Promise<UserDTO> {
		const createDTO = new userModel(dto);
		return await createDTO.save();
	}
	public async createGoogle(dto: UserGoogleDTO): Promise<UserDTO> {
		const createDTO = new userModel(dto);
		return await createDTO.save();
	}
	public async getAllUsers(): Promise<UserDTO[]> {
		return await userModel
			.find({
				email: { $ne: 'admin@mbe.com' },
				role: { $ne: 3 },
				deleted: false,
			})
			.exec();
	}
	public async getDashbordUsers(
		fromdate: string,
		todate: string
	): Promise<UserDTO[]> {
		console.log(
			'getDashbordUsers',
			moment(fromdate, 'YYYY-M-DD').format(),
			moment(todate, 'YYYY-M-DD').format()
		);
		return await userModel
			.find({
				'created.at': {
					$gte: moment(fromdate, 'YYYY-M-DD').format(),
					$lt: moment(todate, 'YYYY-M-DD').add(1, 'days').format(),
				},
				email: { $ne: 'admin@mbe.com' },
				role: { $ne: 3 },
			})
			.exec();
	}
	public async getSiteUsers(): Promise<UserDTO[]> {
		return await userModel.find({ role: 3 }).exec();
	}
	public async getById(id: string): Promise<UserDTO> {
		return await userModel.findById(id).exec();
	}
	public async getByIds(filter: any): Promise<UserDTO[]> {
		return await userModel.find(filter).exec();
	}
	public async getByEmail(email: string): Promise<UserDTO> {
		return await userModel
			.findOne({ $and: [{ email }, { deleted: false }] })
			.exec();
	}
	public async getByEmail2(email: string, status: string): Promise<UserDTO> {
		return await userModel.findOne({ email, status }).exec();
	}
	public async update(id: string, dto: UserDTO): Promise<UserDTO> {
		const updateDTO = await userModel.findById(id).exec();
		Object.assign(updateDTO, dto);
		return await updateDTO.save();
	}
	public async updatePass(email: string, npass: string) {
		return userModel.findOneAndUpdate({ email }, { password: npass });
	}
	public async updateBenId(id: string, bid: string) {
		return userModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ beneficiaryId: bid }
		);
	}
	public async updateEmailVerif(email: string) {
		return userModel.findOneAndUpdate({ email }, { emailVerified: true });
	}
	public async delete(id: string) {
		return userModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ delete: true }
		);
	}
	public async delete1(id: string) {
		return userModel.remove({ _id: mongoose.Types.ObjectId(id) }).exec();
	}
	public async statusChange(id: string, params: any) {
		if (params.status === 'Active') {
			return userModel.findOneAndUpdate(
				{ _id: mongoose.Types.ObjectId(id) },
				{ status: 'Not Active' }
			);
		}
		return userModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ status: 'Active' }
		);
	}
	public async updateRememberToken(id: string, remember_token: any) {
		return userModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ remember_token: remember_token }
		);
	}

	public async statusChangeActive(id: string) {
		return userModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ status: 'Active', emailVerified: true }
		);
	}

	public async updatePhoto(id: string, image: any) {
		return userModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ profilePhoto: image }
		);
	}

	public async getByToken(remember_token: string): Promise<UserDTO> {
		return await userModel.findOne({ remember_token }).exec();
	}

	public async deleteAccount(id: string): Promise<UserDTO> {
		return userModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ deleted: true }
		);
	}

	public async reactivateDeletedAccount(id: string): Promise<UserDTO> {
		return userModel.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(id) },
			{ deleted: false }
		);
	}
}
