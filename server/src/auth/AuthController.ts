'use strict';

import {BlockchainClient} from '../blockchain/client/blockchainClient';
import {LoggerInstance} from 'winston';
import {ClientAuthenticator} from './ClientAuthenticator';

export class AuthController {
  public constructor(private blockchainService: BlockchainClient,
                     private logger: LoggerInstance) { }

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
}
