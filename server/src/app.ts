'use strict';

import {Routes} from './routes';
import {BlockchainFactory} from './blockchain/BlockchainFactory';
import {LoggerFactory} from './utils/LoggerFactory';
import {Config} from './config';
import {Response, NextFunction} from 'express';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';
import { DeployPolicy } from './blockchain/Blockchain';

class App {
  public async run(): Promise<void> {
    const logger            = LoggerFactory.create();
    const app               = express();
    const blockchain        = BlockchainFactory.create(logger, Config.getServerDirectory());
    const chaincodeId       = await blockchain.init(DeployPolicy.NEVER);
    logger.debug('[App]', 'Using chaincode id', chaincodeId);
    const blockchainService = await blockchain.createClient(chaincodeId);
    process.on('unhandledRejection', (error: Error, promise: Promise<any>) => {
      logger.error(error.stack);
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use('/', express.static(path.join(__dirname, '../client')));
    app.use(morgan(null, <morgan.Options>{
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

    // catch 404 and forward to error handler
    app.use((req: any, res: any, next: any) => {
      res.status(404);
      res.json({message: 'Not found'});
      next();
    });

    // error handlers
    app.use((err: any, res: Response, next: NextFunction) => {
      logger.error('Headers: %s\nOriginalUrl: %s\nMethod: %s\nBody: %s\nStacktrace: %s', this.objectToString(err.headers), err.originalUrl, err.method, this.objectToString(err.body), err.stack);
      res.status(500);
      res.json({
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err.stack : true,
      });

      next();
    });

    const port = (process.env.VCAP_APP_PORT || 8080);
    const host = (process.env.VCAP_APP_HOST || 'localhost');
    app.listen(port);

    // print a message when the server starts listening
    logger.info(`[NodeJS] Express server listening at http://${host}:${port}`);
  }

  private objectToString(object: any): string {
    let output = '';

    for (let propertyName in object) {
      if (object.hasOwnProperty(propertyName)) {
        output += propertyName + ': ' + object[propertyName] + '\n';
      }
    }

    return output;
  }
}

new App().run();