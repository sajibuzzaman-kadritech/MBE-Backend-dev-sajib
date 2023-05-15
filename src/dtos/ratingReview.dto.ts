export class RatingReviewDTO {
    public _id: string;
    public added: {
      at: Date;
    };
    public itemId: string;
    public userId: string;
    public review: string;
    public rating: number;
    public deleted: boolean;
}

export class reviewCustomOutput {
  public itemId: string;
  public userId: string;
  public review: string;
  public rating: string;
  public deleted: boolean;
  public username: string;
  public _id: string;
 
  public added: {
      at: Date;
  };
  
}
