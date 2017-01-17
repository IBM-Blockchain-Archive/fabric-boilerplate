'use strict';

import 'reflect-metadata';
import {Routes} from './routes';
import {BlockchainFactory} from './blockchain/BlockchainFactory';
import {LoggerFactory} from './utils/LoggerFactory';
import {Config} from './config';
import {NextFunction} from 'express';
import {DeployPolicy} from './blockchain/Blockchain';
import {useExpressServer, useContainer} from 'routing-controllers';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';
import * as cors from 'cors';
import {Container} from 'typedi';

class App {
    public async run(): Promise<void> {
        const logger = new LoggerFactory().create();
        const blockchain = BlockchainFactory.create(logger, Config.getServerDirectory());
        const chaincodeId = await blockchain.init(DeployPolicy.NEVER);
        const app = express();
        logger.debug('[App]', 'Using chaincode id', chaincodeId);
        const blockchainService = await blockchain.createClient(chaincodeId);
        process.on('unhandledRejection', (error: Error, promise: Promise<any>) => {
            logger.error(error.stack);
        });

        app.use(cors());

        app.use((req: any, res: any, next: NextFunction) => {
            req.blockchain = blockchainService;
            next();
        });

        useContainer(Container);
        // initialize routing
        useExpressServer(app, {
            routePrefix: '/api/v1',
            controllers: [__dirname + '/api/v1/*.js']
        });
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(cookieParser());
        app.use('/', express.static(path.join(__dirname, '../client/dist')));
        app.use(morgan(null, <morgan.Options> {
            stream: {
                skip: (req: any, res: any) => res.statusCode < 400,
                write: (message: string): void => {
                    logger.debug(message);
                }
            }
        }));

        // routes
        const expressRouter = express.Router();
        new Routes(blockchainService, logger).register(expressRouter);
        app.use('/', expressRouter);

        const port = (process.env.VCAP_APP_PORT || 8080);
        const host = (process.env.VCAP_APP_HOST || 'localhost');
        app.listen(port);

        // print a message when the server starts listening
        logger.info(`[NodeJS] Express server listening at http://${host}:${port}`);
    }
}

new App().run();