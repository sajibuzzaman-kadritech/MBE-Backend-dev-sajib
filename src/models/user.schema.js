"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const passportLocalMongoose = require('passport-local-mongoose');
const currentTime = (0, moment_1.default)().toISOString();
const userSchema = new mongoose_1.default.Schema({
    email: {
        match: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
        required: true,
        trim: true,
        type: String,
    },
    password: {
        trim: true,
        type: String,
    },
    name: {
        type: String,
        default: '',
    },
    beneficiaryId: {
        type: String,
    },
    gender: {
        type: String,
        default: '',
    },
    dob: {
        type: String,
        default: '',
    },
    phoneno: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        default: 'Not Active',
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    created: {
        at: {
            default: currentTime,
            required: false,
            type: Date,
        },
    },
    updated: {
        at: {
            default: currentTime,
            required: false,
            type: Date,
        },
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        default: 'Email',
    },
    uid: {
        type: String,
        default: '',
    },
    fcmToken: {
        type: String,
        default: '',
    },
    profilePhoto: {
        type: String,
        default: '',
    },
    termsAndConditions: {
        type: Boolean,
        default: false,
    },
    setting: {
        diactivate_account: {
            type: Boolean,
            default: false,
        },
        notification_enabled: {
            type: String,
            default: 'Enabled',
        },
        set_default_language: {
            type: String,
            default: 'English',
        },
    },
    remember_token: {
        type: String,
        default: '',
    },
    role: {
        type: Number,
        default: 2,
    },
    orders: {
        type: Number,
        default: '',
    },
}, { timestamps: true });
userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email',
});
exports.userModel = mongoose_1.default.model('user', userSchema);
//# sourceMappingURL=user.schema.js.map