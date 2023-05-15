export default class DealsDTO {
    public _id: string;
    public added: {
      at: Date;
    };
    public status: string;
    public images: string;
    public name: string;
    public brandName: string;
    public categoryName: string;
    public forSpecificBrand: boolean;
    public forSpecificCategory: boolean;
    public forSpecificSingle:boolean;
    public singleName: string;
    public items: any[];
}
