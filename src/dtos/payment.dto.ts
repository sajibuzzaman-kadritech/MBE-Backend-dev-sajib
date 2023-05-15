export default class PaymentDTO {
    public _id: string;
    public added: {
      at: Date;
    };
    public updated: {
        at: Date;
    };
    public amount: string;
    public currency: string;
    public userId: string;
    public cartId: string;
}
