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
exports.AdminController = void 0;
const express_1 = __importDefault(require("express"));
const authorize_admin_controller_1 = require("./authorize-admin.controller");
const brands_controller_1 = require("./brands.controller");
const category_admin_controller_1 = require("./category-admin.controller");
const homepageBanner_controller_1 = require("./homepageBanner.controller");
class AdminController {
    constructor() {
        this.path = '/admin';
        this.router = express_1.default.Router();
        this.getRoot = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            res.send('Admin API page');
        });
        this.bannerController = new homepageBanner_controller_1.BannerAdmin();
        this.itemsController = new authorize_admin_controller_1.AdminItems();
        this.categoryController = new category_admin_controller_1.CategoryAdmin();
        this.brandsController = new brands_controller_1.Brands();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, this.getRoot);
        this.router.post(`${this.path}/addCategory`, this.categoryController.addNewCategory);
        this.router.get(`${this.path}/getCategories`, this.categoryController.getAllCategories);
        this.router.get(`${this.path}/getCategories/active`, this.categoryController.getActiveCategories);
        this.router.delete(`${this.path}/category/:id`, this.categoryController.deleteCategory);
        this.router.put(`${this.path}/category/update/:id`, this.categoryController.updateCategory);
        this.router.put(`${this.path}/category/:id`, this.categoryController.changeCategoryStatus);
        this.router.get(`${this.path}/category/:id`, this.categoryController.getCategoryById);
        this.router.get(`${this.path}/brands`, this.brandsController.getActiveBrands);
        this.router.get(`${this.path}/admin/brands`, this.brandsController.getAllBrands);
        this.router.delete(`${this.path}/brands/:id`, this.brandsController.deleteBrand);
        this.router.post(`${this.path}/brands`, this.brandsController.addNewBrands);
        this.router.put(`${this.path}/brand/:id`, this.brandsController.changeBrandStatus);
        this.router.put(`${this.path}/brand/update/:id`, this.brandsController.updateBrand);
        this.router.get(`${this.path}/brand/:id`, this.brandsController.getBrandById);
        this.router.get(`${this.path}/items`, this.itemsController.getAllItems);
        this.router.get(`${this.path}/bnr`, this.bannerController.getAllBanners);
        this.router.post(`${this.path}/bnr`, this.bannerController.addNewBanner);
        this.router.delete(`${this.path}/bnr/:id`, this.bannerController.deleteBanners);
        this.router.put(`${this.path}/bnr/:id`, this.bannerController.changeBannerStatus);
        this.router.put(`${this.path}/bnr/update/:id`, this.bannerController.updateBanner);
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map