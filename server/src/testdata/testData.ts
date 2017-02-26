'use strict';

const testData = require('../../resources/testData.json');
import {BlockchainClient} from '../blockchain/client/blockchainClient';
import {LoggerInstance} from 'winston';
import {User} from '../entities/user.model';

export class TestData {
  public constructor(private blockchainClient: BlockchainClient, private logger: LoggerInstance) { }

  public async invokeTestData(): Promise<any> {
    this.logger.info('[TestData] Deploying Test Data');
    await this.resetIndexes();
    return this.writeTestDataToLedger(testData);
  }

  private resetIndexes(): Promise<any> {
    this.logger.info('[TestData] Resetting indexes:');
    const functionName = 'resetIndexes';
    const args         = [];
    const enrollmentId = 'WebAppAdmin';

    return this.blockchainClient.invoke(functionName, args, enrollmentId);
  }

  private writeTestDataToLedger(testData: any): Promise<any>  {
    testData.users = testData.users.map(
        (user: any) => new User(user.userID, user.password, user.username)
    );

    const functionName = 'addTestdata';
    const args         = [JSON.stringify(testData)];
    const enrollmentId = 'WebAppAdmin';

    return this.blockchainClient.invoke(functionName, args, enrollmentId).then((result: any) => {
      this.logger.info('[TestData] Added testdata');
    }).catch((err: any) => {
      this.logger.error(err);
    });
  }
}
