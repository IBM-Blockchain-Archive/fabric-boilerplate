'use strict';

import {TestData} from './testdata/testData';
import {BlockchainFactory} from './blockchain/BlockchainFactory';
import {LoggerFactory} from './utils/LoggerFactory';
import {Config} from './config';
import * as winston from 'winston';
import {DeployPolicy} from './blockchain/Blockchain';

class DeployApp {
  private logger: winston.LoggerInstance;

  public constructor() {
    this.logger = new LoggerFactory().create();
  }

  public async deploy(): Promise<void> {
    const blockchain = BlockchainFactory.create(this.logger, Config.getServerDirectory());

    try {
      let chaincodeId      = await blockchain.init(DeployPolicy.ALWAYS);
      let blockchainClient = await blockchain.createClient(chaincodeId);
      blockchain.saveChaincodeId(chaincodeId);

      new TestData(blockchainClient, this.logger).invokeTestData().then(() => {
        this.logger.info('Deployed chaincode and added testdata. Chaincode Id:');
        console.log(chaincodeId);
        process.exit(0);
      }).catch((err: Error) => {
        throw new Error(err.message);
      });
    } catch (err) {
      this.logger.error(err.message);
      process.exit(1);
    }
  }
}

/* Set GOPATH (for deploying chaincode) */
process.env.GOPATH = process.cwd() + '/../blockchain';

new DeployApp().deploy();