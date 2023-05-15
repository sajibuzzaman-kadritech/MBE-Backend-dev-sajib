"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
require('source-map-support').install();
const admin_controller_1 = require("./controllers/admin/admin.controller");
const home_page_controller_1 = require("./controllers/home.page.controller");
const websocket_1 = __importDefault(require("./websocket"));
const http = require('http');
const app = new app_1.default([
    new admin_controller_1.AdminController(),
    new home_page_controller_1.HomeController(),
]);
app.listen();
(0, websocket_1.default)(app.server);
//# sourceMappingURL=server.js.map