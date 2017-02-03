import {BlockchainRequest} from './BlockchainRequest';
import {LoggerInstance} from 'winston';
import {Member, TransactionContext} from 'hfc/lib/hfc';

export class BlockchainInvokeRequest extends BlockchainRequest {
  public constructor(chaincodeID: string,
                     chaincodeFunctionName: string,
                     chaincodeArguments: string[],
                     logger: LoggerInstance,
                     blockchainUsername: string,
                     chain: any) {
    super(chaincodeID, chaincodeFunctionName, chaincodeArguments, logger, 'invoke', blockchainUsername, chain);
  }

  protected doRequest(blockchainUser: Member, request: any): TransactionContext {
    return blockchainUser.invoke(request);
  }

  protected processResults(results: any): any {
    return results;
  }
}