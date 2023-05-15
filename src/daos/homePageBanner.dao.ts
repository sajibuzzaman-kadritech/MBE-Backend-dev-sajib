import mongoose from 'mongoose';
import BannerDTO from '../dtos/homePageBanner.dto';
import { bannerModel } from '../models/banner.schema';

export default class BannerDAO {

  public async create(dto: BannerDTO): Promise<BannerDTO> {
    const createDTO = new bannerModel(dto);
    return await createDTO.save();
  }
  public async getActiveBanners(filter: any): Promise<BannerDTO[]> {

    return await bannerModel.find(filter).exec();
}

  public async getAllBanners(): Promise<BannerDTO[]> {
      return await bannerModel.find({ delete: false }).exec();
  }
  public async getById(id: string): Promise<BannerDTO> {
    return await bannerModel.findById(id).exec();
}
  public async update(id: string, dto: BannerDTO): Promise<BannerDTO> {
    const updateDTO = await bannerModel.findById(id).exec();
    Object.assign(updateDTO, dto);
    return await updateDTO.save();
  }
  public async delete(id: string) {
    return bannerModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { delete: true, status: 'Not Active' });
  }
  public async statusChange(id: string, params: any) {
    if (params.status === 'Active') {
      return bannerModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { status: 'Not Active' });
    }
    return bannerModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { status: 'Active' });

  }

}
