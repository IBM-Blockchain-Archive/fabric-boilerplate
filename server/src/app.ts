import 'reflect-metadata';
import {useExpressServer, useContainer} from 'routing-controllers';
import {Container} from 'typedi';
import {Request, Response} from 'express';
import * as morgan from 'morgan';
import * as express from 'express';
import * as winston from 'winston';
import * as cors from 'cors';

import {BlockchainFactory} from './blockchain/BlockchainFactory';
import {LoggerFactory} from './utils/LoggerFactory';
import {Config} from './config';
import {DeployPolicy} from './blockchain/Blockchain';
import {BlockchainClient} from './blockchain/client/blockchainClient';

class App {
    private logger: winston.LoggerInstance = new LoggerFactory().create();

    public async run(): Promise<void> {
        const app = express();
        app.use(cors());

        // Dependency injection
        useContainer(Container);
        Container.set(LoggerFactory, new LoggerFactory());
        Container.set(BlockchainClient, await this.initializeBlockchain());

        // initialize routing
        useExpressServer(app, {
            routePrefix: '/api/v1',
            controllers: [__dirname + '/api/v1/*.js']
        });

        // Log requests
        app.use(morgan('dev', <morgan.Options> {
            stream: {
                skip: (request: Request, response: Response) => response.statusCode < 400,
                write: (message: string): void => {
                    this.logger.debug(message);
                }
            }
        }));

        // Start server
        const port = (process.env.VCAP_PORT || process.env.PORT || 8080);
        const host = (process.env.VCAP_HOST || process.env.HOST || 'localhost');
        app.listen(port);
        this.logger.info(`[App] Express server listening at http://${host}:${port}`);
    }

    private async initializeBlockchain(): Promise<BlockchainClient> {
        const blockchain = BlockchainFactory.create(this.logger, Config.getServerDirectory());
        const chaincodeId = await blockchain.init(DeployPolicy.NEVER);
        const blockchainClient = await blockchain.createClient(chaincodeId);
        this.logger.debug('[App]', 'Using chaincode id', chaincodeId);
        return blockchainClient;
    }
}

process.on('unhandledRejection', (error: Error, promise: Promise<any>) => {
    this.logger.error('Unhandled rejection', error.stack);
});

new App().run();