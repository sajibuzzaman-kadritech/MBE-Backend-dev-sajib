export default class AddressDTO {
    public _id: string;
    public added: {
      by: string;
      at: Date;
    };
    public userId: string;
    public country: string;
    public addressLine1: string;
    public addressLine2: string;
    public city: string;
    public state: string;
    public postalCode: number;
    public primary: boolean;
    public addressType: string;
    public mobile: string;
    public name: string;
}
