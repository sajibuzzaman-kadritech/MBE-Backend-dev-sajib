import mongoose from 'mongoose';
import AddressDTO from './address.dto';

export class UserDTO {
    public _id: string;
    public name: string;
    public status: string;
    public emailVerified: boolean;
    public gender: string;
    public created: {
        at: Date;
    };
    public updated: {
        at: Date;
    };
    public password: string;
    public email: string;
    public deleted: boolean;
    public phoneno: string;
    public termsAndConditions: boolean;
    public setting: {
        diactivate_account: string;
        notification_enabled: string;
        set_default_language: string;
    };
    public type: string;
    public uid: string;
    public fcmToken?: string;
    public dob: string;
    public profilePhoto: string;
    public senderImage: string;
    public beneficiaryId: string;
    public remember_token: string;
    public role: string;
    public orders: number;
}
export class UserGoogleDTO {
    public name: string;
    public emailVerified: boolean;
    public email: string;
    public type: string;
    public uid: string;
    public deleted: boolean;
    public termsAndConditions: boolean;
}

export class AllUsers {
    public userDetails: UserDTO;
    public address: AddressDTO;
}
