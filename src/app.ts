import bodyParser from 'body-parser';
import config from 'config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import * as admin from 'firebase-admin';
import mongoose from 'mongoose';
import IController from './common/controller-interface';
import errorHandler from './error/error-handler';
import moment from 'moment-timezone';
moment.tz.setDefault('Africa/Lagos');

class App {
	public app: express.Application;
	public server: any;

	constructor(controllers: IController[]) {
		this.app = express();

		this.initializeFirebase();
		this.initializeDatabase();
		this.initializeMiddlewares();
		this.initializeControllers(controllers);
		this.initializeErrorHandler();
	}

	public listen() {
		/*this.app.listen(6007, () => {
      const a = 100;
    });*/
		this.server = this.app.listen(3001, () => {
			console.log('Server started on port http://localhost:3001');
		});
	}

	public getServer() {
		return this.app;
	}

	private async initializeFirebase() {
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
	}
	private async initializeDatabase() {
		const options = {
			// If not connected, return errors immediately rather than waiting for reconnect
			bufferMaxEntries: 0,
			connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
			poolSize: 10, // Maintain up to 10 socket connections
			reconnectTries: 300,
			reconnectInterval: 1000, // Reconnect every 500ms
			socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
			useFindAndModify: false, // deprecation warning,
		};

		mongoose.Promise = require('bluebird');
		mongoose.set('maxTimeMS', config.get<number>('database.query-max-ms'));
		const dbConnectionString =
			config.get<string>('database.platform.connection-string') +
			config.get<string>('database.platform.db-name');
		const connectWithRetry = () => {
			mongoose
				.connect(dbConnectionString, options)
				.then(() => {
					console.log('Database connection successful');
				})
				.catch((err) => {
					setTimeout(connectWithRetry, 5000);
				});
		};
		connectWithRetry();
	}

	private initializeMiddlewares() {
		const corsOptions = {
			origin: config.get<string>('cors.origin'),
		};
		// Middleware for CORS
		this.app.use(cors(corsOptions));

		// Middlewares for bodyparsing using both json and urlencoding
		this.app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
		this.app.use(bodyParser.json({ limit: '50mb' }));
		this.app.use(express.json());
		this.app.use(cookieParser());
		// this.app.use(multer());
		/*this.app.use(express.static(path.join(__dirname, "public")));
    this.app.use(favicon(path.join(__dirname, "public", "favicon.ico")));*/
	}

	private initializeControllers(controllers: IController[]) {
		controllers.forEach((controller) => {
			this.app.use('/', controller.router);
		});
	}
	private initializeErrorHandler() {
		this.app.use(errorHandler);
	}
}

export default App;
