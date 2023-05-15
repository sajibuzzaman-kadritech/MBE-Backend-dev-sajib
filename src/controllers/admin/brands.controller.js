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
exports.Brands = void 0;
const config_1 = __importDefault(require("config"));
const brands_dao_1 = __importDefault(require("../../daos/brands.dao"));
const catch_error_1 = __importDefault(require("../../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../../error/handled-application-error"));
class Brands {
    constructor() {
        this.getAllBrands = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.BrandsDAO.getAllBrands();
                // for (const con of result) {
                //   const filenameL = con.images.split('?')[0];
                //   const filename = filenameL.split('/')[filenameL.split('/').length - 1];
                //   const url = await this.readPreSignedUrl(filename);
                //   con.images = url;
                // }
                res.json(result.sort((y, x) => +new Date(x.added.at) - +new Date(y.added.at)));
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getActiveBrands = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.BrandsDAO.getActiveBrands();
                // for (const con of result) {
                //   const filenameL = con.images.split('?')[0];
                //   const filename = filenameL.split('/')[filenameL.split('/').length - 1];
                //   const url = await this.readPreSignedUrl(filename);
                //   con.images = url;
                // }
                res.json(result.sort((y, x) => +new Date(x.added.at) - +new Date(y.added.at)));
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.deleteBrand = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.BrandsDAO.delete(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.changeBrandStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const status = req.body;
                const result = yield this.BrandsDAO.statusChange(id, status);
                res.json({ data: 'success' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateBrand = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const brandData = req.body;
                const result = yield this.BrandsDAO.update(id, brandData);
                res.json({ success: true, status: 'success' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getBrandById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.BrandsDAO.getById(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.addNewBrands = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                if (!dto.images) {
                    throw new handled_application_error_1.default(401, 'brand image required');
                }
                const result = yield this.BrandsDAO.create(dto);
                res.json({ status: 'success' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.readPreSignedUrl = (fileName) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Storage } = require('@google-cloud/storage');
                // Creates a client
                const storage = new Storage({
                    projectId: config_1.default.get('gcp.projectId'),
                    keyFilename: 'for-poc-325210-a7e014fe2cab.json',
                });
                const options = {
                    version: 'v4',
                    action: 'read',
                    expires: Date.now() + 450 * 60 * 1000, // 15 minutes
                };
                const [url] = yield storage
                    .bucket(config_1.default.get('gcp.bucket'))
                    .file(fileName)
                    .getSignedUrl(options);
                return url;
            }
            catch (err) {
                return '';
            }
        });
        this.BrandsDAO = new brands_dao_1.default();
    }
}
exports.Brands = Brands;
//# sourceMappingURL=brands.controller.js.map