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
exports.CategoryAdmin = void 0;
const category_dao_1 = __importDefault(require("../../daos/category.dao"));
const config_1 = __importDefault(require("config"));
const catch_error_1 = __importDefault(require("../../error/catch-error"));
const handled_application_error_1 = __importDefault(require("../../error/handled-application-error"));
class CategoryAdmin {
    constructor() {
        this.getAllCategories = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.categoryDAO.getAllCategories();
                // for (const con of result) {
                //     const filenameL = con.images.split('?')[0];
                //     const filename = filenameL.split('/')[filenameL.split('/').length - 1];
                //     const url = await this.readPreSignedUrl(filename);
                //     con.images = url;
                //     if(con.icon != null){
                //       const filenameIcon = con.icon.split('?')[0];
                //       const filenameI = filenameIcon.split('/')[filenameIcon.split('/').length - 1];
                //       const urlIcon = await this.readPreSignedUrl(filenameI);
                //       con.icon = urlIcon;
                //     }
                // }
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getActiveCategories = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.categoryDAO.getActiveCategories();
                // for (const con of result) {
                //   const filenameL = con.images.split('?')[0];
                //   const filename = filenameL.split('/')[filenameL.split('/').length - 1];
                //   const url = await this.readPreSignedUrl(filename);
                //   con.images = url;
                //   if(con.icon != null){
                //     const filenameIcon = con.icon.split('?')[0];
                //     const filenameI = filenameIcon.split('/')[filenameIcon.split('/').length - 1];
                //     const urlIcon = await this.readPreSignedUrl(filenameI);
                //     con.icon = urlIcon;
                //   }
                // }
                res.json(result.sort((y, x) => +new Date(x.added.at) - +new Date(y.added.at)));
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.deleteCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.categoryDAO.delete(id);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.changeCategoryStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const status = req.body;
                const result = yield this.categoryDAO.statusChange(id, status);
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.updateCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const categoryData = req.body;
                const result = yield this.categoryDAO.update(id, categoryData);
                res.json({ success: true, status: 'success' });
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.getCategoryById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this.categoryDAO.getById(id);
                // const filenameL = result.images.split('?')[0];
                // const filename = filenameL.split('/')[filenameL.split('/').length - 1];
                // const url = await this.readPreSignedUrl(filename);
                // result.images = url;
                // const filenameC = result.images.split('?')[0];
                // const filenameIc = filenameC.split('/')[filenameC.split('/').length - 1];
                // const urlIc = await this.readPreSignedUrl(filenameIc);
                // result.icon = urlIc;
                res.json(result);
            }
            catch (err) {
                (0, catch_error_1.default)(err, next);
            }
        });
        this.addNewCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                // check for a valid category and sub category
                if (dto.name) {
                    const name = dto.name;
                    const resu = yield this.getAllCat();
                    if (resu.includes(name)) {
                        throw new handled_application_error_1.default(401, 'category already exist');
                    }
                }
                // check if image string is not empty
                if (!dto.images) {
                    throw new handled_application_error_1.default(401, 'image required');
                }
                const result = yield this.categoryDAO.create(dto);
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
                return url;
            }
            catch (err) {
                return '';
            }
        });
        this.categoryDAO = new category_dao_1.default();
    }
    getAllCat() {
        return __awaiter(this, void 0, void 0, function* () {
            const cat = yield this.categoryDAO.getAllCategories();
            const categoryList = [];
            for (const val of cat) {
                categoryList.push(val.name);
            }
            return categoryList;
        });
    }
}
exports.CategoryAdmin = CategoryAdmin;
//# sourceMappingURL=category-admin.controller.js.map