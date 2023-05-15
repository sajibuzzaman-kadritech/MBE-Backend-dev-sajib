export class CartDTO {
    public _id: string;
    public added: {
      at: Date;
    };
    public userId: string;
    public is_ordered: string;
    public items: any;
}
export class CartAddDTO {
  public _id: string;
  public added: {
    at: Date;
  };
  public userId: string;
  public is_ordered: string;
  public itemId: string;
  public quantity: number;
}
