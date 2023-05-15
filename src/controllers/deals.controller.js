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
exports.Deals = void 0;
const bson_1 = require("bson");
const config_1 = __importDefault(require("config"));
const deals_dao_1 = __importDefault(require("../daos/deals.dao"));
const items_dao_1 = __importDefault(require("../daos/items.dao"));
const catch_error_1 = __importDefault(require("../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../error/handled-application-error"));
const moment_1 = __importDefault(require("moment"));
class Deals {
    constructor() {
        this.getAllDealsAdmin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.DealsDAO.getAllDeals();
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getActiveDeals = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.DealsDAO.getActiveDeals();
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.deleteDeal = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.DealsDAO.delete(id);
                if (result.items.length > 0) {
                    const deal = 'none';
                    const ids = result.items.map((item, index) => {
                        return item._id;
                    });
                    const updateMulti = yield this.itemsDAO.updateMultiple(ids, { deal });
                }
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.changeDealStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { status } = req.body;
                const result = yield this.DealsDAO.statusChange(id, { status });
                if (result.items.length > 0) {
                    if (status == 'Active') {
                        const deal = 'none';
                        const ids = result.items.map((item, index) => {
                            return item._id;
                        });
                        const updateMulti = yield this.itemsDAO.updateMultiple(ids, { deal });
                    }
                    else {
                        const deal = result.name;
                        const ids = result.items.map((item, index) => {
                            return item._id;
                        });
                        const updateMulti = yield this.itemsDAO.updateMultiple(ids, { deal });
                    }
                }
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateDeal = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const dealData = req.body;
                dealData.items = dealData.items.map((item, index) => {
                    let obj = Object.assign({}, item);
                    obj._id = new bson_1.ObjectID(obj._id);
                    return obj;
                });
                const result = yield this.DealsDAO.update(id, dealData);
                if (result.items.length > 0) {
                    const deal = result.name;
                    const ids = result.items.map((item, index) => {
                        return new bson_1.ObjectId(item._id).toString();
                    });
                    const updateMulti = yield this.itemsDAO.updateMultiple(ids, { deal });
                }
                res.json({ success: true, status: 'success' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getDealById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.DealsDAO.getById(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.addNewDeal = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const currentTime = (0, moment_1.default)().toISOString();
                dto.added = {
                    // @ts-ignore
                    at: currentTime
                };
                if (!dto.images) {
                    throw new handled_application_error_1.default(401, 'deal image required');
                }
                const result = yield this.DealsDAO.create(dto);
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
        this.DealsDAO = new deals_dao_1.default();
        this.itemsDAO = new items_dao_1.default();
    }
}
exports.Deals = Deals;
//# sourceMappingURL=deals.controller.js.map