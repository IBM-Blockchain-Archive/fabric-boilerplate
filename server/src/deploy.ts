'use strict';

import {TestData} from './testdata/testData';
import {BlockchainFactory} from './blockchain/BlockchainFactory';
import {LoggerFactory} from './utils/LoggerFactory';
import {Config} from './config';
import * as winston from 'winston';
import {DeployPolicy} from './blockchain/Blockchain';
import {BlockchainClient} from './blockchain/client/blockchainClient';

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

      // On bluemix we need a timeout after deployment, or the invocation will fail silently.
      let timeout = process.env.NODE_ENV === 'production' ? 120000 : 10;
      this.logger.debug('[Deploy]', `Waiting ${timeout} milliseconds before invoking testdata.`);
      setTimeout(() => {
        this.invokeTestDataAndExit(blockchainClient, chaincodeId);
      }, timeout);
    } catch (err) {
      this.logger.error(err.message);
      process.exit(1);
    }
  }

  private invokeTestDataAndExit(blockchainClient: BlockchainClient, chaincodeId: string): void {
    new TestData(blockchainClient, this.logger).invokeTestData().then(() => {
      this.logger.info('[Deploy]', 'Deployed chaincode and added testdata. Chaincode Id:');
      console.log(chaincodeId);
      process.exit(0);
    }).catch((err: Error) => {
      throw new Error(err.message);
    });
  }
}

/* Set GOPATH (for deploying chaincode) */
process.env.GOPATH = process.cwd() + '/../blockchain';

new DeployApp().deploy();