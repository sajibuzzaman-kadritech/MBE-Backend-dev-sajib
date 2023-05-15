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
exports.Cart = void 0;
const config_1 = __importDefault(require("config"));
const mongoose_1 = __importDefault(require("mongoose"));
const cart_dao_1 = __importDefault(require("../daos/cart.dao"));
const items_dao_1 = __importDefault(require("../daos/items.dao"));
const shippingtax_dao_1 = __importDefault(require("../daos/shippingtax.dao"));
const catch_error_1 = __importDefault(require("../error/catch-error"));
const adminsettings_dao_1 = __importDefault(require("../daos/adminsettings.dao"));
const tax_dao_1 = __importDefault(require("../daos/tax.dao"));
class Cart {
    constructor() {
        this.getByUserId = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const l = [];
                const id = req.params.id;
                let result = yield this.CartDAO.getCartByUserId(id);
                // result = result[0];
                if (result === null) {
                    res.json({ status: false, message: 'No data found!' });
                    return;
                }
                const filter1 = {};
                filter1.$or = [{ status: 'Active' }, { status: 'Active' }];
                const shipping = yield this.shippingtaxDAO.getByFilter1(filter1); //get shipping data
                const tax = yield this.taxDAO.getByFilter1(filter1); //get tax data
                let total = 0;
                let sub_total = 0;
                let taxes = 0;
                let shipping_fees = 0;
                let shipping_type = '';
                let tax_type = '';
                if (tax !== null && tax.length > 0) {
                    taxes = parseInt(tax[0].tax_value, 10);
                    tax_type = tax[0].tax_type;
                }
                if (shipping !== null && shipping.length > 0) {
                    shipping_fees = parseInt((_a = shipping[0]) === null || _a === void 0 ? void 0 : _a.shipping_value, 10);
                    shipping_type = (_b = shipping[0]) === null || _b === void 0 ? void 0 : _b.shipping_amount_type;
                }
                for (const i of result.items) {
                    let item = yield this.itemsDAO.getItemById(i.itemId);
                    item = item[0];
                    item.quantity = i.quantity;
                    //total = total + item.price * i.quantity;
                    const str = item.deal.toString();
                    let disCountPrice = item.price;
                    if (str) {
                        const dealType = str.split(' ')[1];
                        const dealPrice = str.split(' ')[0];
                        if (dealType === '%') {
                            disCountPrice =
                                item.price - (item.price * parseInt(dealPrice, 10)) / 100;
                        }
                        else if (dealType === 'off') {
                            disCountPrice = item.price - parseInt(dealPrice, 10);
                        }
                        else {
                            disCountPrice = item.price;
                        }
                    }
                    total = total + disCountPrice * i.quantity;
                    item.added = result.added;
                    item.updated = result.added;
                    item.disCountPrice = disCountPrice;
                    const newImages = [];
                    l.push(item);
                }
                const resBody = {
                    _id: result._id,
                    added: result.added,
                    userId: result.userId,
                    is_ordered: result.is_ordered,
                    items: l,
                };
                let shipping_amount = 0;
                if (shipping_type === 'fixed') {
                    shipping_amount = shipping_fees;
                }
                else if (shipping_type === '%') {
                    shipping_amount = (total * shipping_fees) / 100;
                }
                let taxes_amount = 0;
                if (tax_type === 'fixed') {
                    taxes_amount = taxes;
                }
                else if (tax_type === '%') {
                    taxes_amount = (total * taxes) / 100;
                }
                let cart_sub_total = {
                    total_amount: Number(total + taxes_amount + shipping_amount).toFixed(2),
                    taxes: taxes,
                    taxesType: tax_type,
                    shipping_fees: shipping_fees,
                    shippingType: shipping_type,
                    sub_total: total,
                };
                const filter = {};
                filter.$or = [{ status: 'Active' }, { status: 'Not Active' }];
                const est_data = yield this.adminsettingsDAO.getByFilter1(filter);
                res.json({
                    success: true,
                    status: 'added successfully!',
                    data: resBody,
                    cartTotal: cart_sub_total,
                    est_delivery: est_data[0].est_delivery,
                });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.CartDAO.getById(id);
                const l = [];
                let total = 0;
                for (const i of result.items) {
                    const item = yield this.itemsDAO.getItemById(i.itemId);
                    item.quantity = i.quantity;
                    total = total + item.price * i.quantity;
                    item.added = result.added;
                    item.updated = result.added;
                    l.push(item);
                }
                const resBody = {
                    _id: result._id,
                    added: result.added,
                    userId: result.userId,
                    is_ordered: 'No',
                    items: l,
                };
                const filter = {};
                filter.$or = [{ status: 'Active' }, { status: 'Not Active' }];
                const est_data = yield this.adminsettingsDAO.getByFilter1(filter);
                res.json({
                    data: resBody,
                    cartTotal: total,
                    est_delivery: est_data[0].est_delivery,
                });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getAllUsersCarts = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.CartDAO.getAllUsersCarts();
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.deleteCart = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.CartDAO.delete(id);
                if (result) {
                    res.json({
                        success: true,
                        status: 'delete cart successfully!',
                        result: req.params.id,
                    });
                }
                else {
                    res.json({
                        success: true,
                        status: 'cart id not found!',
                        result: req.params.id,
                    });
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.addItemToCart = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const cart = yield this.CartDAO.getCartByUserId(dto.userId);
                if (cart) {
                    //res.json({ success: true, status: 'INN' });
                    let itemlist = [];
                    let newItem = false;
                    //cart has items
                    if (cart.items.length > 0) {
                        for (const i of cart.items) {
                            if (i.itemId === dto.itemId) {
                                if (dto.quantity > 0) {
                                    i.quantity = dto.quantity;
                                    itemlist.push(i);
                                }
                                newItem = true;
                            }
                            else {
                                itemlist.push(i);
                            }
                        }
                        if (!newItem && dto.quantity > 0) {
                            let item = yield this.itemsDAO.getItemById(dto.itemId);
                            item = item[0];
                            console.log('add to cart if', item);
                            itemlist.push({
                                itemId: dto.itemId,
                                quantity: dto.quantity,
                                itemName: item.name,
                                itemPrice: item.price,
                                itemDeal: item.deal,
                                itemBrand: item.brand,
                                itemCategory: item.category,
                                itemImages: item.images,
                            });
                            console.log('itemlist', itemlist);
                        }
                        //cart doesn't have any items
                    }
                    else {
                        if (dto.quantity > 0) {
                            let item = yield this.itemsDAO.getItemById(dto.itemId);
                            item = item[0];
                            console.log('add to cart else', item);
                            itemlist.push({
                                itemId: dto.itemId,
                                quantity: dto.quantity,
                                itemName: item.name,
                                itemPrice: item.price,
                                itemDeal: item.deal,
                                itemBrand: item.brand,
                                itemCategory: item.category,
                                itemImages: item.images,
                            });
                        }
                    }
                    const result = this.CartDAO.update(cart._id, itemlist);
                    //GET UPDATED CART
                    const l = [];
                    const result2 = yield this.CartDAO.getCartByUserId(dto.userId);
                    let total = 0;
                    let sub_total = 0;
                    let taxes = 10;
                    let shipping_fees = 10;
                    for (const i of result2.items) {
                        const item = yield this.itemsDAO.getItemById(i.itemId);
                        item.quantity = i.quantity;
                        total = total + item.price * i.quantity;
                        item.added = result2.added;
                        item.updated = result2.added;
                        l.push(item);
                    }
                    /* const resBody: CartDTO = {
              _id: result2._id,
              added: result2.added,
              userId: result2.userId,
              items: await this.CartDAO.getCartByUserId(dto.userId)
            };
            */
                    const resBody = yield this.CartDAO.getCartByUserId(dto.userId);
                    //res.json({ data: resBody, cartTotal: total });
                    //END GET CART
                    let cart_sub_total;
                    if (resBody.items.length == 0) {
                        cart_sub_total = 0;
                    }
                    else {
                        cart_sub_total = {
                            sub_total: total - taxes - shipping_fees,
                            taxes: taxes,
                            shipping_fees: shipping_fees,
                            total_amount: total,
                        };
                    }
                    res.json({
                        success: true,
                        status: 'update successfully!',
                        data: resBody,
                        cartTotal: cart_sub_total,
                    });
                }
                else {
                    let item = yield this.itemsDAO.getItemById(dto.itemId);
                    item = item[0];
                    // console.log("else no cart create", item);
                    const adddto = {
                        userId: dto.userId,
                        is_ordered: 'No',
                        _id: mongoose_1.default.Types.ObjectId().toHexString(),
                        added: {
                            at: new Date(),
                        },
                        items: [
                            {
                                itemId: dto.itemId,
                                quantity: dto.quantity,
                                itemName: item.name,
                                itemPrice: item.price,
                                itemDeal: item.deal,
                                itemBrand: item.brand,
                                itemCategory: item.category,
                                itemImages: item.images,
                            },
                        ],
                    };
                    const result = yield this.CartDAO.create(adddto);
                    //GET UPDATED CART
                    const l = [];
                    const result2 = yield this.CartDAO.getCartByUserId(dto.userId);
                    let total = 0;
                    let sub_total = 0;
                    let taxes = 10;
                    let shipping_fees = 10;
                    for (const i of result2.items) {
                        const item = yield this.itemsDAO.getItemById(i.itemId);
                        item.quantity = i.quantity;
                        total = total + item.price * i.quantity;
                        item.added = result2.added;
                        item.updated = result2.added;
                        result2.is_ordered = 'No';
                        l.push(item);
                    }
                    //res.json(result2.is_ordered);
                    const resBody = {
                        _id: result2._id,
                        added: result2.added,
                        userId: result2.userId,
                        is_ordered: result2.is_ordered,
                        items: l,
                    };
                    //res.json({ data: resBody, cartTotal: total });
                    //END GET CART
                    let cart_sub_total = {
                        sub_total: sub_total,
                        taxes: taxes,
                        shipping_fees: shipping_fees,
                        total_amount: total,
                    };
                    res.json({
                        success: true,
                        status: 'added successfully!',
                        data: resBody,
                        cartTotal: cart_sub_total,
                    });
                    //res.json({ success: true, status: 'added successfully!' });
                }
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.readPreSignedUrl = (fileName) => __awaiter(this, void 0, void 0, function* () {
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
            }
            catch (err) {
                return '';
            }
        });
        this.CartDAO = new cart_dao_1.default();
        this.itemsDAO = new items_dao_1.default();
        this.adminsettingsDAO = new adminsettings_dao_1.default();
        this.shippingtaxDAO = new shippingtax_dao_1.default();
        this.taxDAO = new tax_dao_1.default();
    }
}
exports.Cart = Cart;
//# sourceMappingURL=cart.controller.js.map