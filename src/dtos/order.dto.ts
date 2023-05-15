import AddressDTO from './address.dto';
import { CartDTO } from './cart.dto';
import { UserDTO } from './user.dto';

export class OrdersDTO {
	public _id: string;
	public orderplaced: {
		at: Date;
	};
	public updated: {
		at: Date;
	};
	public ordershipped: {
		at: Date;
	};
	public orderdelivered: {
		at: Date;
	};
	public ordercancelled: {
		at: Date;
	};
	public cancellationReason: string;
	public paymentId: string;
	public cartId: string;
	public userId: string;
	public shippingId: string;
	public transactionId: string;
	public paymentType: string;
	public orderStatus: string;
	public paymentStatus: string;
	public shippingCourierId: string;
	public paymentsDetails: any;
	public pos: boolean;
	public isPaid: boolean;
}

export class OrderCustomOutput {
	public userDetails: any;
	public shippingAddress: any;
	public transactionDetails: any;
	public ItemsOrdered: any;
	public paymentId: string;
	public paymentType: string;
	public orderStatus: string;
	public paymentStatus: string;
	public shippingCourierId: string;
	public paymentsDetails: any;
	public _id: string;
	public orderplaced: {
		at: Date;
	};
	public updated: {
		at: Date;
	};
	public ordershipped: {
		at: Date;
	};
	public orderdelivered: {
		at: Date;
	};
	public ordercancelled: {
		at: Date;
	};
	public cancellationReason: string;
}

export class OrderUserCustomOutput {
	public shippingAddress: any;
	public transactionDetails: any;
	public ItemsOrdered: any;
	public paymentType: string;
	public paymentId: string;
	public orderStatus: string;
	public paymentStatus: string;
	public shippingCourierId: string;
	public paymentsDetails: any;
	public _id: string;
	public orderplaced: {
		at: Date;
	};
	public updated: {
		at: Date;
	};
	public ordershipped: {
		at: Date;
	};
	public orderdelivered: {
		at: Date;
	};
	public ordercancelled: {
		at: Date;
	};
	public cancellationReason: string;
}
