import {BlockchainClient} from './blockchain/client/blockchainClient';
import {LoggerInstance} from 'winston';
import {AuthRoute} from './auth/index';

export class Routes {
  public constructor(private blockchainClient: BlockchainClient, private logger: LoggerInstance) { }

  public register(expressRouter: any): void {
    expressRouter.all('/api/*', (req: any, res: any, next: any) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
      next();
    });

    expressRouter.all('/auth/*', (req: any, res: any, next: any) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
      next();
    });

    new AuthRoute().register(this.blockchainClient, expressRouter, this.logger);
  };
}