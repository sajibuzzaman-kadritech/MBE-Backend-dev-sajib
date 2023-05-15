"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
const config_1 = __importDefault(require("config"));
const util_1 = require("util");
const catch_error_1 = __importDefault(require("../error/catch-error"));
const moment_1 = __importDefault(require("moment"));
const { Storage } = require('@google-cloud/storage');
class Util {
    constructor() {
        this.getPreSignedUrl = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // const storage = new Storage(
                //     {
                //         projectId: config.get<string>('gcp.projectId'),
                //         keyFilename: 'for-poc-325210-a7e014fe2cab.json',
                //     }
                // );
                // const options = {
                //     version: 'v4',
                //     action: 'write',
                //     expires: Date.now() + 15 * 60 * 1000, // 15 minutes
                //     contentType: `image/${req.body.fileType}`,
                // };
                // console.log(req.files);
                let imagePaths = [];
                // let files = JSON.parse(JSON.stringify(req.files));
                let files = req.files;
                let length = files.length;
                for (let i = 0; i < length; i++) {
                    // console.log(`files[${i}]`, files[i]);
                    // @ts-ignore
                    let imagePath = yield this.uploadImage(files[i]);
                    imagePaths.push(imagePath);
                }
                // let imagePath =  await this.uploadImage(req.files.images);
                // console.log(image);
                // const [url] = await storage
                //     .bucket(config.get<string>('gcp.bucket'))
                //     .file(req.body.fileName)
                //     .getSignedUrl(options);
                //     console.log('###########url11111111111', `https://storage.googleapis.com/${config.get<string>('gcp.bucket')}/${req.body.fileName}`);
                //     console.log("#url",url);
                res.json({ success: true, status: 'success', url: imagePaths });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.makeid = (length) => {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() *
                    charactersLength));
            }
            return result;
        };
        this.uploadImage = (file) => new Promise((resolve, reject) => {
            const { originalname, buffer } = file;
            const blob = new Storage({
                projectId: config_1.default.get('gcp.projectId'),
                keyFilename: 'for-poc-325210-a7e014fe2cab.json',
            }).bucket(config_1.default.get('gcp.bucket')).file(this.makeid(9) + (0, moment_1.default)().valueOf() + "_" + originalname);
            const blobStream = blob.createWriteStream({
                resumable: false,
                contentType: `${file.mimetype}`
            }).on('finish', () => {
                const publicUrl = (0, util_1.format)(`https://storage.googleapis.com/${config_1.default.get('gcp.bucket')}/${blob.name}`);
                resolve(publicUrl);
            })
                .on('error', () => {
                reject(`Unable to upload image, something went wrong`);
            })
                .end(buffer);
        });
        this.getPreSignedUrlSingle = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let imagePaths = [];
                //@ts-ignore
                let photo = req.file;
                let imagePath = yield this.uploadImage(photo);
                imagePaths.push(imagePath);
                res.json({ success: true, status: 'success', url: imagePaths });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
    }
}
exports.Util = Util;
//# sourceMappingURL=util.controller.js.map