export default class ReviewDTO {
    public _id: string;
    public added: Date;
    public senderId: string;
    public productId: string;
    public message: string;
    public rating: string;
    public updated: Date;
    public status: string;
    }

    export class reviewCustomOutput {
        public senderId: string;
        public productId: string;
        public message: string;
        public rating: string;
        public username: string;
        public _id: string;
        public added: Date;
        
      }
