import moment from 'moment';
import mongoose from 'mongoose';
import { OrdersDTO } from '../dtos/order.dto';
import { orderModel } from '../models/order.schema';

export default class OrderDAO {
	public async create(dto: OrdersDTO): Promise<OrdersDTO> {
		const createDTO = new orderModel(dto);
		return await createDTO.save();
	}
	public async getAllOrders(
		fromdate: string,
		todate: string
	): Promise<OrdersDTO[]> {
		//const d = new Date().toISOString();
		// console.log('from',new Date(fromdate), moment(fromdate, "YYYY-M-DD").format());
		// console.log('to',new Date(todate), moment(todate, "YYYY-M-DD").format());

		// const paymentSuccess = await orderModel.find({ "orderplaced.at" : {  "$gte":  new Date(fromdate) ,"$lt" : new Date(todate) }, paymentStatus: 'Success'}).exec();
		// const orderPending = await orderModel.find({ "orderplaced.at" : {  "$gte":  new Date(fromdate) ,"$lt" : new Date(todate) }, orderStatus: 'Pending'}).exec()
		const orderdelivered = await orderModel
			.find({
				'orderplaced.at': {
					$gte: moment(fromdate, 'YYYY-M-DD').format(),
					$lt: moment(todate, 'YYYY-M-DD').add('1', 'days').format(),
				},
				orderStatus: 'Delivered',
			})
			.exec();
		console.log('orderdelivered', orderdelivered);
		return orderdelivered;
	}

	public async getAllNotDeliveredOrders(
		fromdate: string,
		todate: string
	): Promise<OrdersDTO[]> {
		//const d = new Date().toISOString();
		// console.log('from',new Date(fromdate), moment(fromdate, "YYYY-M-DD").format());
		// console.log('to',new Date(todate), moment(todate, "YYYY-M-DD").format());

		// const paymentSuccess = await orderModel.find({ "orderplaced.at" : {  "$gte":  new Date(fromdate) ,"$lt" : new Date(todate) }, paymentStatus: 'Success'}).exec();
		// const orderPending = await orderModel.find({ "orderplaced.at" : {  "$gte":  new Date(fromdate) ,"$lt" : new Date(todate) }, orderStatus: 'Pending'}).exec()
		const orderdelivered = await orderModel
			.find({
				'orderplaced.at': {
					$gte: moment(fromdate, 'YYYY-M-DD').format(),
					$lt: moment(todate, 'YYYY-M-DD').add('1', 'days').format(),
				},
				orderStatus: { $ne: 'Delivered' },
			})
			.exec();
		console.log('orderdelivered', orderdelivered);
		return orderdelivered;
	}

	public async getAllOrders1(): Promise<OrdersDTO[]> {
		//const d = new Date().toISOString();

		return await orderModel.find().exec();
	}
	public async getAllOrders2(cartId: string): Promise<OrdersDTO[]> {
		return await orderModel.find({ cartId: cartId }).exec();
	}
	public async getById(id: string): Promise<OrdersDTO> {
		return await orderModel.findById(id).exec();
	}

	public async getByPaymentId(id: string): Promise<OrdersDTO[]> {
		return await orderModel.find({ paymentId: id }).exec();
	}

	public async getByFilter2(
		filter: any,
		limit: any,
		offset: any
	): Promise<OrdersDTO[]> {
		return await orderModel
			.find(filter)
			.sort({ _id: -1 })
			.limit(parseInt(limit.toString(), 10))
			.skip(parseInt(offset.toString(), 10));
	}
	public async getByFilter(
		filter: any,
		limit: any,
		offset: any
	): Promise<OrdersDTO[]> {
		return await orderModel
			.find(filter)
			.sort({ _id: -1 })
			.limit(parseInt(limit.toString(), 10))
			.skip(parseInt(offset.toString(), 10));
	}
	public async update(id: string, dto: OrdersDTO): Promise<OrdersDTO> {
		const updateDTO = await orderModel.findById(id).exec();
		Object.assign(updateDTO, dto);
		return await updateDTO.save();
	}
	public async updatestatus(id: string, transId: string): Promise<OrdersDTO> {
		const currentTime = moment().toISOString();
		return await orderModel.findOneAndUpdate(
			{ paymentId: id },
			{
				orderPlaced: {
					at: currentTime
				},
				paymentStatus: 'Success',
				orderStatus: 'Ordered',
				transactionId: transId,
			}
		);
	}
	public async updatefailedstatus(
		id: string,
		transId: string
	): Promise<OrdersDTO> {
		return await orderModel.findOneAndUpdate(
			{ paymentId: id },
			{
				paymentStatus: 'Failed',
				orderStatus: 'Ordered',
				transactionId: transId,
			}
		);
	}

	public async cancelOrderUpdate(
		id: string,
		cancellationReason: string
	): Promise<OrdersDTO> {
		const currentTime = moment().toISOString();
		return await orderModel.findOneAndUpdate(
			{ _id: id },
			{ ordercancelled: currentTime, cancellationReason: cancellationReason }
		);
	}

	public async deleteOrderIfCancelled(id: string): Promise<OrdersDTO> {
		return await orderModel.deleteOne({ _id: mongoose.Types.ObjectId(id) });
	}
}
