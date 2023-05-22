import express from 'express';
import IController from '../../common/controller-interface';
import { AdminItems } from './authorize-admin.controller';
import { Brands } from './brands.controller';
import { CategoryAdmin } from './category-admin.controller';
import { BannerAdmin } from './homepageBanner.controller';

export class AdminController implements IController {
  public path = '/admin';
  public router = express.Router();

  private readonly bannerController: BannerAdmin;
  private readonly itemsController: AdminItems;
  private readonly categoryController: CategoryAdmin;
  private readonly brandsController: Brands;
  constructor() {
    this.bannerController = new BannerAdmin();
    this.itemsController = new AdminItems();
    this.categoryController = new CategoryAdmin();
    this.brandsController = new Brands();
    this.initializeRoutes();
  }

  private initializeRoutes() {
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
  private readonly getRoot = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.send('Admin API page---new');
  }
}
