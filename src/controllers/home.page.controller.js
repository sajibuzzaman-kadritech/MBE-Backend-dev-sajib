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
exports.HomeController = void 0;
const express_1 = __importDefault(require("express"));
const Multer = require('multer');
const multer = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 15 * 1024 * 1024, // no larger than 15mb, you can change as needed.
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == 'image/png' ||
            file.mimetype == 'image/jpg' ||
            file.mimetype == 'image/jpeg') {
            cb(null, true);
        }
        else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    },
});
const address_controller_1 = require("./address.controller");
const authorize_admin_controller_1 = require("./admin/authorize-admin.controller");
const homepageBanner_controller_1 = require("./admin/homepageBanner.controller");
const cart_controller_1 = require("./cart.controller");
const deals_controller_1 = require("./deals.controller");
const forgetPassword_controller_1 = require("./forgetPassword.controller");
const item_controller_1 = require("./item.controller");
const message_controller_1 = require("./message.controller");
const delivery_controller_1 = require("./delivery.controller");
const adminsettings_controller_1 = require("./adminsettings.controller");
const shippingtax_controller_1 = require("./shippingtax.controller");
const order_controller_1 = require("./order.controller");
const notification_controller_1 = require("./notification.controller");
const ratingReview_controller_1 = require("./ratingReview.controller");
const user_controller_1 = require("./user.controller");
const util_controller_1 = require("./util.controller");
const tax_controller_1 = require("./tax.controller");
const review_controller_1 = require("./review.controller");
class HomeController {
    constructor() {
        this.path = '/home';
        this.router = express_1.default.Router();
        this.getRoot = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            res.send('Home Page');
        });
        this.messageController = new message_controller_1.Message();
        this.deliveryController = new delivery_controller_1.Delivery();
        this.adminsettingsController = new adminsettings_controller_1.Adminsettings();
        this.shippingtaxController = new shippingtax_controller_1.Shippingtax();
        this.forgetPasswordController = new forgetPassword_controller_1.ForgotPassword();
        this.userController = new user_controller_1.User();
        this.bannerController = new homepageBanner_controller_1.BannerAdmin();
        this.itemController = new item_controller_1.Items();
        this.dealsController = new deals_controller_1.Deals();
        this.cartController = new cart_controller_1.Cart();
        this.reviewRatingController = new ratingReview_controller_1.RatingReview();
        this.itemsController = new authorize_admin_controller_1.AdminItems();
        this.utilController = new util_controller_1.Util();
        this.addressController = new address_controller_1.Address();
        this.orderController = new order_controller_1.Orders();
        this.notificationController = new notification_controller_1.Notification();
        this.taxController = new tax_controller_1.Tax();
        this.reviewController = new review_controller_1.Review();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, this.getRoot);
        // User Apis
        this.router.post(`${this.path}/util/presignedurl`, multer.any(), this.utilController.getPreSignedUrl);
        this.router.post(`${this.path}/util/presignedurl/single`, multer.single('photo'), this.utilController.getPreSignedUrlSingle);
        this.router.post(`${this.path}/user/signup`, this.userController.addUser);
        this.router.post(`${this.path}/user/signup_token_verify`, this.userController.signupTokenVerify);
        this.router.post(`${this.path}/user/fgt_token_verify_set_npwd`, this.userController.forgetTokenVerifySetNpwd);
        this.router.post(`${this.path}/user/login`, this.userController.login);
        this.router.put(`${this.path}/user/profile`, this.userController.updateUser);
        this.router.put(`${this.path}/user/profile/:id`, this.userController.changeStatus);
        this.router.delete(`${this.path}/user/profile/:id`, this.userController.deleteStatus);
        this.router.delete(`${this.path}/user/profile/delete/:id`, this.userController.deleteUserAccount);
        this.router.post(`${this.path}/gsignUp/:idToken`, this.userController.googleSignUp);
        this.router.post(`${this.path}/glogin/:idToken`, this.userController.googleLogin);
        this.router.get(`${this.path}/user/profile`, this.userController.getUserByUserId);
        this.router.get(`${this.path}/user/setting`, this.userController.getUserSettingByUserId);
        this.router.get(`${this.path}/user/profile/email`, this.userController.getUserByEmail);
        this.router.get('/admin/profile', this.userController.getAllUsers);
        this.router.put(`${this.path}/user/profile/photo/:id`, this.userController.updateProfilePhoto);
        //this.router.post(`${this.path}/user/editprofile`, this.userController.editUserProfile);
        this.router.post(`${this.path}/user/admin/signup`, this.userController.addAdminUser);
        this.router.get('/admin/profile/site', this.userController.getSiteUsers);
        this.router.get(`${this.path}/user/profilebytoken`, this.userController.getUserById);
        // Deals Apis
        this.router.post(`${this.path}/deals`, this.dealsController.addNewDeal);
        this.router.put(`${this.path}/deals/:id`, this.dealsController.changeDealStatus);
        this.router.put(`${this.path}/deals/update/:id`, this.dealsController.updateDeal);
        this.router.delete(`${this.path}/deals/:id`, this.dealsController.deleteDeal);
        this.router.get(`${this.path}/deals`, this.dealsController.getActiveDeals);
        this.router.get('/admin/deals', this.dealsController.getAllDealsAdmin);
        this.router.get(`${this.path}/deals/:id`, this.dealsController.getDealById);
        // Cart Apis
        this.router.post(`${this.path}/cart`, this.cartController.addItemToCart);
        this.router.delete(`${this.path}/cart/:id`, this.cartController.deleteCart);
        this.router.get(`${this.path}/user/cart/:id`, this.cartController.getByUserId);
        this.router.get('/admin/cart', this.cartController.getAllUsersCarts);
        this.router.get(`${this.path}/cart/:id`, this.cartController.getById);
        // Rating Review Apis
        this.router.post(`${this.path}/reviewRating`, this.reviewRatingController.addNewRatingReview);
        this.router.delete(`${this.path}/reviewRating/:id`, this.reviewRatingController.deleteRatingReview);
        this.router.get(`${this.path}/user/reviewRating/:id`, this.reviewRatingController.getByUserId);
        this.router.get('/admin/reviewRating', this.reviewRatingController.getAllRatingsandReview);
        this.router.get(`${this.path}/reviewRating/:id`, this.reviewRatingController.getById);
        this.router.put(`${this.path}/reviewRating/:id`, this.reviewRatingController.updateReviewRating);
        this.router.put(`${this.path}/reviewRating/:id`, this.reviewRatingController.updateReviewRating);
        this.router.get('/admin/reviewRating', this.reviewRatingController.getAllRatingsandReview);
        this.router.get(`${this.path}/reviewRating/product/:id`, this.reviewRatingController.getByItemId);
        // ITEMS(PRODUCT) APIS
        this.router.post(`${this.path}/addItem/:id`, this.itemsController.addItem);
        this.router.get('/home/item', this.itemController.getItems);
        this.router.get('/home/top_selling_items', this.itemController.topSellingItems);
        this.router.get('/home/top_rated_items', this.itemController.getTopRatedItems);
        this.router.post('/home/import_item_csv', this.itemController.importItemsFromCSV);
        this.router.get('/my/item/:id', this.itemController.getFavouriteItems);
        this.router.post('/admin/item', this.itemsController.addItem);
        this.router.post('/admin/export/item', this.itemsController.addExportItem);
        this.router.get('/admin/item', this.itemsController.getAllItems);
        this.router.put('/item/:id', this.itemsController.updateItems);
        this.router.delete('/admin/unlist/item/:id', this.itemsController.deleteItem);
        this.router.put('/admin/relist/item/:id', this.itemsController.relistItem);
        this.router.get('/home/item/:id', this.itemController.getByItemsId);
        this.router.get('/banners/active', this.bannerController.getActiveBanners);
        this.router.post('/favourite/add', this.itemController.setFavouriteItems);
        this.router.get('/favourite', this.itemController.getFavouriteItems);
        this.router.post('/home/forgetpassword', this.forgetPasswordController.forgotPassword);
        //this.router.post('/home/forgetpassword', this.forgetPasswordController.emailSendingTest);
        this.router.post('/changepassword', this.forgetPasswordController.changePassword);
        this.router.get('/home/pricerange', this.itemController.getItemsRange);
        this.router.get('/home/dealitem', this.itemController.getDealItems);
        this.router.get('/home/item/search/:key', this.itemController.getItemsSerach);
        // Address Apis
        this.router.post(`${this.path}/address`, this.addressController.addNewAddress);
        this.router.get(`${this.path}/address/:id`, this.addressController.getAddressById);
        this.router.get(`${this.path}/address`, this.addressController.getUserAddresses);
        this.router.put(`${this.path}/address/:id`, this.addressController.updateAddress);
        this.router.put(`${this.path}/address/primary`, this.addressController.getPrimaryUserAddresses);
        this.router.delete(`${this.path}/deleteaddress/:id`, this.addressController.deleteAddress);
        // Order Apis
        this.router.post(`${this.path}/order`, this.orderController.addNewOrders);
        this.router.post(`${this.path}/order_card`, this.orderController.addNewCardOrders);
        this.router.put(`${this.path}/order/:id`, this.orderController.updateOrders);
        this.router.delete(`${this.path}/delete_order_status/:id`, this.orderController.deleteOrderIfCancelled);
        this.router.put(`${this.path}/beneficiary/add`, this.orderController.addUserBankRefund);
        this.router.get(`/admin/initiate/refund`, this.orderController.initiateRefund);
        this.router.get('/admin/orders', this.orderController.getByFilter);
        this.router.get('/admin/trans', this.orderController.getByTransactionsFilter);
        this.router.get(`${this.path}/orders`, this.orderController.getByUserFilter);
        this.router.get(`${this.path}/order-tracking`, this.orderController.orderTrackingByOrderId);
        this.router.get(`${this.path}/order/:id`, this.orderController.getByOrderId);
        this.router.get('/payment/success/:id', this.orderController.updateOrdersStatus);
        this.router.get('/payment/failed/:id', this.orderController.failedOrdersStatus);
        this.router.get('/admin/dashboard', this.orderController.totalDashBoard);
        this.router.get(`${this.path}/get-filter`, this.itemController.getItemsFilter);
        this.router.get(`${this.path}/orderdetails/:id`, this.orderController.getByTxnId);
        // Message Apis
        this.router.post(`${this.path}/message`, this.messageController.startChat);
        this.router.put(`${this.path}/message/:id`, this.messageController.updateChat);
        this.router.get(`${this.path}/user/chat`, this.messageController.getChatForUser);
        this.router.get(`${this.path}/user/chat/:id`, this.messageController.getChatByChatId);
        this.router.get(`${this.path}/chats`, this.messageController.getChats);
        // Delivery Apis ADMIN and USER
        this.router.post(`${this.path}/delivery`, this.deliveryController.addDeliveryCity);
        this.router.put(`${this.path}/delivery/:id`, this.deliveryController.updateDeliveryCity);
        //this.router.get(`${this.path}/get_delivery_cities/:id`, this.deliveryController.getAllDeliveryCities);
        this.router.get(`${this.path}/deliverycities`, this.deliveryController.getAllDeliveryCities);
        //this.router.get(`${this.path}/chats`, this.messageController.getChats);
        this.router.delete(`${this.path}/delivery/:id`, this.deliveryController.deleteCity);
        // ShippingTax Apis ADMIN and USER
        this.router.post(`${this.path}/shippingtax`, this.shippingtaxController.addShippingTax);
        this.router.put(`${this.path}/shippingtax/:id`, this.shippingtaxController.updateShippingtax);
        this.router.get(`${this.path}/getshippingtaxs`, this.shippingtaxController.getAllShippingtaxes);
        this.router.delete(`${this.path}/shippingtax/:id`, this.shippingtaxController.deleteShipping);
        // tax Apis ADMIN and USER
        this.router.post(`${this.path}/tax`, this.taxController.addTax);
        this.router.put(`${this.path}/tax/:id`, this.taxController.updateTax);
        this.router.get(`${this.path}/tax`, this.taxController.getAllTaxes);
        this.router.delete(`${this.path}/tax/:id`, this.taxController.deleteTax);
        // EST Delivery(ADMIN SETTINGS) APIS ADMIN AND USER
        this.router.post(`${this.path}/add_est_delivery`, this.adminsettingsController.addESTDelivery);
        this.router.put(`${this.path}/adminsettings/:id`, this.adminsettingsController.updateAdminSettings);
        this.router.get(`${this.path}/getadminsettings`, this.adminsettingsController.getAllAdminSettings);
        this.router.post(`${this.path}/add_tmc`, this.adminsettingsController.addTMC);
        this.router.put(`${this.path}/update_tmc/:id`, this.adminsettingsController.updateTMC);
        this.router.get(`${this.path}/tmc`, this.adminsettingsController.getAllTMC);
        //Notification Apis
        this.router.get(`${this.path}/notifications`, this.notificationController.getAllNotifications);
        this.router.post(`${this.path}/add_notifications`, this.notificationController.scheduleNotification);
        //review & rating
        this.router.post(`${this.path}/review`, this.reviewController.addReview);
        this.router.get(`${this.path}/review/:id`, this.reviewController.getAllReview);
        this.router.get(`${this.path}/review/product/:id`, this.reviewController.getReviewByProductId);
        this.router.get(`${this.path}/rating/product/:id`, this.reviewController.getRatingByProductId);
    }
}
exports.HomeController = HomeController;
//# sourceMappingURL=home.page.controller.js.map