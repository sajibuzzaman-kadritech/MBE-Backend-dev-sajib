import mongoose from 'mongoose';
import { CartDTO } from '../dtos/cart.dto';
import { cartModel } from '../models/cart.schema';

export default class CartDAO {

  public async create(dto: CartDTO): Promise<CartDTO> {
    const createDTO = new cartModel(dto);
    return await createDTO.save();
  }
  public async getAllUsersCarts(): Promise<CartDTO[]> {
      return await cartModel.aggregate(
          [{
              $unwind: {
                  path: '$items'
              }
          }, {
              $replaceRoot: {
                  newRoot: '$items'
              }
          }, {
              $addFields: {
                  item_id: {
                      $toObjectId: '$itemId'
                  }
              }
          }, {
              $lookup: {
                  from: 'items',
                  localField: 'item_id',
                  foreignField: '_id',
                  as: 'product'
              }
          }, {
              $unwind: {
                  path: '$product'
              }
          }, {
              $addFields: {
                  category_id: {
                      $toObjectId: '$product.category._id'
                  }
              }
          }, {
              $lookup: {
                  from: 'categories',
                  localField: 'category_id',
                  foreignField: '_id',
                  as: 'category_obj'
              }
          }, {
              $unwind: {
                  path: '$category_obj'
              }
          }, {
              $addFields: {
                  brand_id: {
                      $toObjectId: '$product.brand._id'
                  }
              }
          }, {
              $lookup: {
                  from: 'brands',
                  localField: 'brand_id',
                  foreignField: '_id',
                  as: 'brand_obj'
              }
          }, {
              $unwind: {
                  path: '$brand_obj'
              }
          }]
      ).exec();
  }
  public async getCartByUserId(id: string): Promise<CartDTO> {
    return await cartModel.findOne({ userId: id,is_ordered:'No' }).exec();
}
public async getOrderedCartsByUserId(filter: any): Promise<CartDTO[]>{
  return await cartModel.find(filter).exec();
}
  public async getById(id: string): Promise<CartDTO> {
    return await cartModel.findById(id).exec();
  }
  public async getByIds(filter: any): Promise<CartDTO[]> {
    return await cartModel.find(filter).exec();
  }
  public async update(id: string, itemList: any): Promise<CartDTO> {
    return await cartModel.findByIdAndUpdate(id, { items: itemList });
  }
  public async update_is_ordered(id: string, itemList: any): Promise<CartDTO> {
    return await cartModel.findByIdAndUpdate(id, { is_ordered: itemList });
  }
  public async delete(id: string) {
    return cartModel.deleteOne({ _id: mongoose.Types.ObjectId(id) });
  }
}
