'use strict';
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k;
				var desc = Object.getOwnPropertyDescriptor(m, k);
				if (
					!desc ||
					('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
				) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k];
						},
					};
				}
				Object.defineProperty(o, k2, desc);
		  }
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k;
				o[k2] = m[k];
		  });
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, 'default', { enumerable: true, value: v });
		  }
		: function (o, v) {
				o['default'] = v;
		  });
var __importStar =
	(this && this.__importStar) ||
	function (mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null)
			for (var k in mod)
				if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
					__createBinding(result, mod, k);
		__setModuleDefault(result, mod);
		return result;
	};
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
const body_parser_1 = __importDefault(require('body-parser'));
const config_1 = __importDefault(require('config'));
const cookie_parser_1 = __importDefault(require('cookie-parser'));
const cors_1 = __importDefault(require('cors'));
const express_1 = __importDefault(require('express'));
const admin = __importStar(require('firebase-admin'));
const mongoose_1 = __importDefault(require('mongoose'));
const error_handler_1 = __importDefault(require('./error/error-handler'));
const moment_timezone_1 = __importDefault(require('moment-timezone'));
moment_timezone_1.default.tz.setDefault('Africa/Lagos');
class App {
	constructor(controllers) {
		this.app = (0, express_1.default)();
		this.initializeFirebase();
		this.initializeDatabase();
		this.initializeMiddlewares();
		this.initializeControllers(controllers);
		this.initializeErrorHandler();
	}
	listen() {
		/*this.app.listen(6007, () => {
          const a = 100;
        });*/
		this.server = this.app.listen(3001, () => {
			console.log('Server started on port 3001');
		});
	}
	getServer() {
		return this.app;
	}
	initializeFirebase() {
		return __awaiter(this, void 0, void 0, function* () {
			const firebaseConfig = {
				apiKey: '',
				authDomain: '',
				projectId: '',
				storageBucket: '',
				messagingSenderId: '',
				appId: '',
				measurementId: '',
			};
			const app = admin.initializeApp(firebaseConfig);
		});
	}
	initializeDatabase() {
		return __awaiter(this, void 0, void 0, function* () {
			const options = {
				// If not connected, return errors immediately rather than waiting for reconnect
				bufferMaxEntries: 0,
				connectTimeoutMS: 10000,
				poolSize: 10,
				reconnectTries: 300,
				reconnectInterval: 1000,
				socketTimeoutMS: 45000,
				useFindAndModify: false, // deprecation warning
				useUnifiedTopology: true,
				useNewUrlParser: true,
			};
			mongoose_1.default.Promise = require('bluebird');
			mongoose_1.default.set(
				'maxTimeMS',
				config_1.default.get('database.query-max-ms')
			);
			const dbConnectionString =
				config_1.default.get('database.platform.connection-string') +
				config_1.default.get('database.platform.db-name');
			const connectWithRetry = () => {
				mongoose_1.default
					.connect(dbConnectionString, options)
					.then(() => {
						const a = 100;
					})
					.catch((err) => {
						setTimeout(connectWithRetry, 5000);
					});
			};
			connectWithRetry();
		});
	}
	initializeMiddlewares() {
		const corsOptions = {
			origin: config_1.default.get('cors.origin'),
		};
		// Middleware for CORS
		this.app.use((0, cors_1.default)(corsOptions));
		// Middlewares for bodyparsing using both json and urlencoding
		this.app.use(
			body_parser_1.default.urlencoded({ extended: true, limit: '50mb' })
		);
		this.app.use(body_parser_1.default.json({ limit: '50mb' }));
		this.app.use(express_1.default.json());
		this.app.use((0, cookie_parser_1.default)());
		// this.app.use(multer());
		/*this.app.use(express.static(path.join(__dirname, "public")));
        this.app.use(favicon(path.join(__dirname, "public", "favicon.ico")));*/
	}
	initializeControllers(controllers) {
		controllers.forEach((controller) => {
			this.app.use('/', controller.router);
		});
	}
	initializeErrorHandler() {
		this.app.use(error_handler_1.default);
	}
}
exports.default = App;
//# sourceMappingURL=app.js.map
