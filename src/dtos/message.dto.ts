export default class MessageDTO {
    public _id: string;
    public added: Date;
    public senderId: string;
    public topic: string;
    public receiverId: string;
    public message: string;
    public chat: any;
    public accepted: Date;
    public updated: Date;
    public endchat: Date;
    public status: string;
    public receiverjointime: Date;
    public senderName: string;
    public senderImage: string;
    public receiverName: string;
    public receiverImage: string;
    public usermsg: string;
    public senderEmail: string;
}
