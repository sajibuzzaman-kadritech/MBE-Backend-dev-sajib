export default class CardDTO {
    public _id: string;
    public added: {
      at: Date;
    };
    public userId: string;
    public name: string;
    public email: string;
    public cvv: string;
    public expiryyear: string;
    public expirymonth: string;
    public cardnumber: string;
}
