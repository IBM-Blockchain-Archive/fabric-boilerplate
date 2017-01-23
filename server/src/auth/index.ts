'use strict';

import {AuthController} from './AuthController';
import {BlockchainClient} from '../blockchain/client/blockchainClient';
import {LoggerInstance} from 'winston';
import {Request, Response, Router} from 'express';

export class AuthRoute {
  public register(blockchainClient: BlockchainClient, expressRouter: Router, logger: LoggerInstance): void {
    const authController = new AuthController(blockchainClient, logger);

    expressRouter.post('/auth/login', (request: Request, response: Response) => authController.loginAsClient(request, response));
  }
}