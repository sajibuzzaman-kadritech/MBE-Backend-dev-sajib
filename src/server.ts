import App from './app';
require('source-map-support').install();
import { AdminController } from './controllers/admin/admin.controller';
import { HomeController } from './controllers/home.page.controller';
import websocket from './websocket';

const http = require('http');

const app = new App([
  new AdminController(),
  new HomeController(),
]);
app.listen();
websocket(app.server);