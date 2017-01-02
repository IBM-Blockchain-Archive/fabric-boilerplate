'use strict';

import {BlockchainClient} from '../blockchain/client/blockchainClient';
import {Config} from '../config';
import * as jwt from 'jsonwebtoken';
import {LoggerInstance} from 'winston';
import {ClientAuthenticator} from './ClientAuthenticator';

export class AuthController {
  public constructor(private blockchainService: BlockchainClient, private logger: LoggerInstance) { }

  public async loginAsClient(req: any, res: any): Promise<void> {
    let clientAuthenticator = new ClientAuthenticator(this.logger, req.body.username, req.body.password, this.blockchainService);

    try {
      res.json(await clientAuthenticator.authenticate());
    } catch (error) {
      res.status(500).send({
        success: false,
        message: 'Server error occurred'
      });
    }
  }

  public verify(req: any, res: any, next: any): void {
    this.logger.debug('verifying API call');

    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (!token) {
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });
    }

    jwt.verify(token, new Config().getSecret(), (err: any, decoded: any) => {
      if (err) {
        return res.json({success: false, message: 'Failed to authenticate token.'});
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        this.logger.debug('Token approved');
        next();
      }
    });
  }
}
