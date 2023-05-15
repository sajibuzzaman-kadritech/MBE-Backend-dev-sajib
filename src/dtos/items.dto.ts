export default class ItemsDTO {
    public _id: string;
    public name: string;
    public description: string;
    public brand: any;
    public category: any;
    public price: number;
    public shop_price: number;
    public quantity: number;
    public keyFeatures: any;
    public specifications: string;
    public images: any;
    public deal: any;
    public product: any;
    public status: string;
    public  reviews: any;
    public rating: number;
    public added: {
        at: Date;
      };
    public updated: {
        at: Date;
      };
    public discount: number;
    public disCountPrice: number;
    public featured: boolean;
    public dealofDay: boolean;
    public favouriteCout: number;
    public favouriteByUser: boolean;
    public newProduct: boolean;
}
