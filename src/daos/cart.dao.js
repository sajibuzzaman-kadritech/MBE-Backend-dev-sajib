"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const cart_schema_1 = require("../models/cart.schema");
class CartDAO {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createDTO = new cart_schema_1.cartModel(dto);
            return yield createDTO.save();
        });
    }
    getAllUsersCarts() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield cart_schema_1.cartModel.aggregate([{
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
                }]).exec();
        });
    }
    getCartByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield cart_schema_1.cartModel.findOne({ userId: id, is_ordered: 'No' }).exec();
        });
    }
    getOrderedCartsByUserId(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield cart_schema_1.cartModel.find(filter).exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield cart_schema_1.cartModel.findById(id).exec();
        });
    }
    getByIds(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield cart_schema_1.cartModel.find(filter).exec();
        });
    }
    update(id, itemList) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield cart_schema_1.cartModel.findByIdAndUpdate(id, { items: itemList });
        });
    }
    update_is_ordered(id, itemList) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield cart_schema_1.cartModel.findByIdAndUpdate(id, { is_ordered: itemList });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return cart_schema_1.cartModel.deleteOne({ _id: mongoose_1.default.Types.ObjectId(id) });
        });
    }
}
exports.default = CartDAO;
//# sourceMappingURL=cart.dao.js.map