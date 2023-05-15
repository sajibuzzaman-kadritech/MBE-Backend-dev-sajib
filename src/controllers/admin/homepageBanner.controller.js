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
exports.BannerAdmin = void 0;
const config_1 = __importDefault(require("config"));
const homePageBanner_dao_1 = __importDefault(require("../../daos/homePageBanner.dao"));
const catch_error_1 = __importDefault(require("../../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../../error/handled-application-error"));
class BannerAdmin {
    constructor() {
        this.getAllBanners = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.bannerDAO.getAllBanners();
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getActiveBanners = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const bannertype = req.query.type;
                const filter = { status: 'Active', delete: false };
                if (bannertype && bannertype !== '') {
                    filter.bannertype = bannertype;
                }
                const result = yield this.bannerDAO.getActiveBanners(filter);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.deleteBanners = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.bannerDAO.delete(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.changeBannerStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const status = req.body;
                const result = yield this.bannerDAO.statusChange(id, status);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateBanner = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const bannerData = req.body;
                const result = yield this.bannerDAO.update(id, bannerData);
                res.json({ success: true, status: 'success' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getBannerById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.bannerDAO.getById(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.addNewBanner = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                if (!dto.images) {
                    throw new handled_application_error_1.default(401, 'image required');
                }
                const result = yield this.bannerDAO.create(dto);
                res.json({ status: 'Success' });
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
                // console.log('uuurrrrllll', url);
                return url;
            }
            catch (err) {
                return '';
            }
        });
        this.bannerDAO = new homePageBanner_dao_1.default();
    }
}
exports.BannerAdmin = BannerAdmin;
//# sourceMappingURL=homepageBanner.controller.js.map