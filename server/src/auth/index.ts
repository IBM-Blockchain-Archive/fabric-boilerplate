'use strict';

import {AuthController} from './AuthController';
import {BlockchainClient} from '../blockchain/client/blockchainClient';
import {LoggerInstance} from 'winston';

export class AuthRoute {
  public register(blockchainClient: BlockchainClient, expressRouter: any, logger: LoggerInstance): void {
    const authController = new AuthController(blockchainClient, logger);

    expressRouter.get('/api/*', (req: any, res: any, next: any) => authController.verify(req, res, next));
    expressRouter.post('/api/*', (req: any, res: any, next: any) => authController.verify(req, res, next));
    expressRouter.post('/auth/login', (req: any, res: any) => authController.loginAsClient(req, res));
  }
}