import mongoose from 'mongoose';
import AddressDTO from '../dtos/address.dto';
import { addressModel } from '../models/address.schema';

export default class AddressDAO {
    public async create(dto: AddressDTO): Promise<AddressDTO> {
        const createDTO = new addressModel(dto);
        return await createDTO.save();
    }
    public async getPrimaryAddressForUser(id: string): Promise<AddressDTO> {
        return await addressModel.findOne({ userId: id, primary: true }).exec();
    }
    public async getByUserId(id: string): Promise<AddressDTO[]> {
        return await addressModel.find({ userId: id }).exec();
    }
    public async getAllAddress(): Promise<AddressDTO[]> {
        return await addressModel.find({ }).exec();
    }
    public async getById(id: string): Promise<AddressDTO> {
        return await addressModel.findById(id).exec();
    }
    public async getByIds(filter: any): Promise<AddressDTO[]> {

        return await addressModel.find(filter).exec();
    }
    public async update(id: string, dto: AddressDTO): Promise<AddressDTO> {
        const updateDTO = await addressModel.findById(id).exec();
        Object.assign(updateDTO, dto);
        return await updateDTO.save();
    }
    public async delete(id: string) {
        return addressModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) });
    }
    public async setPrimary(id: string) {
        await addressModel.findOneAndUpdate({ primary: true }, { primary: false }).exec();
        return addressModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { primary: true });
    }

}
