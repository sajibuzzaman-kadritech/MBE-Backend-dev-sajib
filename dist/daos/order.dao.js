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
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = __importDefault(require("mongoose"));
const order_schema_1 = require("../models/order.schema");
class OrderDAO {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createDTO = new order_schema_1.orderModel(dto);
            return yield createDTO.save();
        });
    }
    getAllOrders(fromdate, todate) {
        return __awaiter(this, void 0, void 0, function* () {
            //const d = new Date().toISOString();
            // console.log('from',new Date(fromdate), moment(fromdate, "YYYY-M-DD").format());
            // console.log('to',new Date(todate), moment(todate, "YYYY-M-DD").format());
            // const paymentSuccess = await orderModel.find({ "orderplaced.at" : {  "$gte":  new Date(fromdate) ,"$lt" : new Date(todate) }, paymentStatus: 'Success'}).exec();
            // const orderPending = await orderModel.find({ "orderplaced.at" : {  "$gte":  new Date(fromdate) ,"$lt" : new Date(todate) }, orderStatus: 'Pending'}).exec()
            const orderdelivered = yield order_schema_1.orderModel
                .find({
                'orderplaced.at': {
                    $gte: (0, moment_1.default)(fromdate, 'YYYY-M-DD').format(),
                    $lt: (0, moment_1.default)(todate, 'YYYY-M-DD').add('1', 'days').format(),
                },
                orderStatus: 'Delivered',
            })
                .exec();
            console.log('orderdelivered', orderdelivered);
            return orderdelivered;
        });
    }
    getAllNotDeliveredOrders(fromdate, todate) {
        return __awaiter(this, void 0, void 0, function* () {
            //const d = new Date().toISOString();
            // console.log('from',new Date(fromdate), moment(fromdate, "YYYY-M-DD").format());
            // console.log('to',new Date(todate), moment(todate, "YYYY-M-DD").format());
            // const paymentSuccess = await orderModel.find({ "orderplaced.at" : {  "$gte":  new Date(fromdate) ,"$lt" : new Date(todate) }, paymentStatus: 'Success'}).exec();
            // const orderPending = await orderModel.find({ "orderplaced.at" : {  "$gte":  new Date(fromdate) ,"$lt" : new Date(todate) }, orderStatus: 'Pending'}).exec()
            const orderdelivered = yield order_schema_1.orderModel
                .find({
                'orderplaced.at': {
                    $gte: (0, moment_1.default)(fromdate, 'YYYY-M-DD').format(),
                    $lt: (0, moment_1.default)(todate, 'YYYY-M-DD').add('1', 'days').format(),
                },
                orderStatus: { $ne: 'Delivered' },
            })
                .exec();
            console.log('orderdelivered', orderdelivered);
            return orderdelivered;
        });
    }
    getAllOrders1() {
        return __awaiter(this, void 0, void 0, function* () {
            //const d = new Date().toISOString();
            return yield order_schema_1.orderModel.find().exec();
        });
    }
    getAllOrders2(cartId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield order_schema_1.orderModel.find({ cartId: cartId }).exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield order_schema_1.orderModel.findById(id).exec();
        });
    }
    getByPaymentId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield order_schema_1.orderModel.find({ paymentId: id }).exec();
        });
    }
    getByFilter2(filter, limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield order_schema_1.orderModel
                .find(filter)
                .sort({ _id: -1 })
                .limit(parseInt(limit.toString(), 10))
                .skip(parseInt(offset.toString(), 10));
        });
    }
    getByFilter(filter, limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield order_schema_1.orderModel
                .find(filter)
                .sort({ _id: -1 })
                .limit(parseInt(limit.toString(), 10))
                .skip(parseInt(offset.toString(), 10));
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateDTO = yield order_schema_1.orderModel.findById(id).exec();
            Object.assign(updateDTO, dto);
            return yield updateDTO.save();
        });
    }
    updatestatus(id, transId) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTime = (0, moment_1.default)().toISOString();
            return yield order_schema_1.orderModel.findOneAndUpdate({ paymentId: id }, {
                orderPlaced: {
                    at: currentTime
                },
                paymentStatus: 'Success',
                orderStatus: 'Ordered',
                transactionId: transId,
            });
        });
    }
    updatefailedstatus(id, transId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield order_schema_1.orderModel.findOneAndUpdate({ paymentId: id }, {
                paymentStatus: 'Failed',
                orderStatus: 'Ordered',
                transactionId: transId,
            });
        });
    }
    cancelOrderUpdate(id, cancellationReason) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTime = (0, moment_1.default)().toISOString();
            return yield order_schema_1.orderModel.findOneAndUpdate({ _id: id }, { ordercancelled: currentTime, cancellationReason: cancellationReason });
        });
    }
    deleteOrderIfCancelled(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield order_schema_1.orderModel.deleteOne({ _id: mongoose_1.default.Types.ObjectId(id) });
        });
    }
}
exports.default = OrderDAO;
//# sourceMappingURL=order.dao.js.map