export default class BannerDTO {
    public _id: string;
    public added: {
      at: Date;
    };
    public images: any;
    public status: string;
    public delete: boolean;
    public name: string;
    public description: string;
    public text: string;
    public bannertype: string;
}
