'use strict';

import {LoggerInstance} from 'winston';
import {BlockchainInvokeRequest} from './BlockchainInvokeRequest';
import {BlockchainQueryRequest} from './BlockchainQueryRequest';

export class BlockchainClient {
  public constructor(private chaincodeID: string,
                     private chain: any,
                     private logger: LoggerInstance) { }

  public async invoke(chaincodeFunctionName: any, args: string[], blockchainUsername: string): Promise<any> {
    let invokeRequest = new BlockchainInvokeRequest(this.chaincodeID, chaincodeFunctionName, args, this.logger, blockchainUsername, this.chain);

    return await invokeRequest.getResult();
  }

  public async query(chaincodeFunctionName: any, args: string[], blockchainUsername: string): Promise<any> {
    let queryRequest = new BlockchainQueryRequest(this.chaincodeID, chaincodeFunctionName, args, this.logger, blockchainUsername, this.chain);

    return await queryRequest.getResult();
  }
}