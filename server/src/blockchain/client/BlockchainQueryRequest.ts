import {BlockchainRequest} from './BlockchainRequest';
import {LoggerInstance} from 'winston';
import {Member, TransactionContext} from 'hfc/lib/hfc';

export class BlockchainQueryRequest extends BlockchainRequest {
  public constructor(chaincodeID: string,
                     chaincodeFunctionName: string,
                     chaincodeArguments: string[],
                     logger: LoggerInstance,
                     blockchainUsername: string,
                     chain: any) {
    super(chaincodeID, chaincodeFunctionName, chaincodeArguments, logger, 'query', blockchainUsername, chain);
  }

  protected doRequest(blockchainUser: Member, request: any): TransactionContext {
    return blockchainUser.query(request);
  }

  protected processResults(results: any): any {
    return JSON.parse(results.result.toString());
  }
}