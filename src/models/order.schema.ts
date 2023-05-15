import mongoose from 'mongoose';
import { OrdersDTO } from '../dtos/order.dto';
import moment from 'moment';

const orderSchema = new mongoose.Schema(
	{
		orderplaced: {
			at: {
				default: moment.utc().toISOString(),
				required: false,
				type: Date,
			},
		},
		updated: {
			at: {
				default: moment.utc().toISOString(),
				required: false,
				type: Date,
			},
		},
		paymentId: {
			type: String,
			default: '',
		},
		cartId: {
			type: String,
			default: '',
		},
		userId: {
			type: String,
			default: '',
		},
		paymentsDetails: {
			taxAmount: {
				type: Number,
				default: 0,
			},
			shippingCharges: {
				type: Number,
				default: 0,
			},
			totalCharges: {
				type: Number,
				default: 0,
			},
			currency: {
				type: String,
				default: 'NGN',
			},
			profitTotal: {
				type: Number,
				default: 0,
			},
		},
		shippingId: {
			type: String,
			default: '',
		},
		transactionId: {
			type: String,
			default: '',
		},
		paymentType: {
			type: String,
			default: '',
		},
		orderStatus: {
			type: String,
			default: 'Pending',
		},
		paymentStatus: {
			type: String,
			default: 'Pending',
		},
		ordershipped: {
			at: {
				default: moment.utc().toISOString(),
				required: false,
				type: Date,
			},
		},
		orderdelivered: {
			at: {
				default: moment.utc().toISOString(),
				required: false,
				type: Date,
			},
		},
		ordercancelled: {
			at: {
				default: moment.utc().toISOString(),
				required: false,
				type: Date,
			},
		},
		cancellationReason: {
			type: String,
			default: '',
		},
		shippingCourierId: {
			type: String,
			default: '',
		},
		pos: {
			type: Boolean,
			required: false,
			default: false,
		},
		items: {
			type: Array,
			required: false,
			default: [],
		},
		isPaid: {
			type: Boolean,
			default: false,
		},
	},
	{ strict: false }
);

export const orderModel = mongoose.model<OrdersDTO & mongoose.Document>(
	'orders',
	orderSchema
);
