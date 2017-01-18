import {BlockchainClient} from './blockchain/client/blockchainClient';
import {LoggerInstance} from 'winston';
import {AuthRoute} from './auth/index';
import {Request, Response, NextFunction, Router} from 'express';

export class Routes {
  public constructor(private blockchainClient: BlockchainClient, private logger: LoggerInstance) { }

  public register(expressRouter: Router): void {
    expressRouter.all('/auth/*', (request: Request, response: Response, next: NextFunction) => {
      response.header('Access-Control-Allow-Origin', '*');
      response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
      next();
    });

    new AuthRoute().register(this.blockchainClient, expressRouter, this.logger);
  };
}