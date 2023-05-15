export default class NotificationDTO {
    public _id: string;
    public name: string;
    public added: {
      at: Date;
    };
    public status: string;
    public type: string;
    public email: string;
    public itemId: string;
}
