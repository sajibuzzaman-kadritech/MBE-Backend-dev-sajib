export default class CategoryDTO {
    public _id: string;
    public added: {
      at: Date;
    };
    public name: string;
    public images: string;
    public icon: string;
    public status: string;
    public delete: boolean;
}
