import {LoggerInstance} from 'winston';
import {Member, TransactionContext} from 'hfc/lib/hfc';
import {BlockchainUserError} from '../../utils/BlockchainUserError';

export abstract class BlockchainRequest {
  public constructor(private chaincodeID: string,
                     private chaincodeFunctionName: string,
                     private chaincodeArguments: string[],
                     private logger: LoggerInstance,
                     private queryType: string,
                     private blockchainUsername: string,
                     private chain: any) { }

  public getResult(): Promise<any> {
    return new Promise<any>(async(resolve: (result: any) => void, reject: (error: Error) => void) => {
      let blockchainUser: Member;

      try {
        blockchainUser = await this.getBlockchainUser(this.blockchainUsername);
      } catch (error) {
        this.logger.info('[SDK] Failed to get blockchain user "' + this.blockchainUsername + '", reason: ', error.message);

        return reject(error);
      }

      let blockchainRequest = {
        chaincodeID: this.chaincodeID,
        fcn:         this.chaincodeFunctionName,
        args:        this.chaincodeArguments,
        attrs:       ['userID']
      };

      let transactionContext = this.doRequest(blockchainUser, blockchainRequest);

      transactionContext.on('submitted', (results: any) => {
        this.logger.info('[SDK] submitted %s: %j', this.queryType, results);
      });
      transactionContext.on('complete', (results: any) => {
        let processedResults = this.processResults(results);

        this.logger.info('[SDK] completed %s: %j', this.queryType, processedResults);

        resolve(processedResults);
      });
      transactionContext.on('error', (err: any) => {
        this.logger.error('[SDK] error on %s: %j', this.queryType, err);
        reject(err);
      });
    });
  }

  private getBlockchainUser(userName: string): Promise<Member> {
    return new Promise<Member>((resolve: (blockchainUser: Member) => void, reject: (error: Error) => void) => {
      this.chain.getUser(userName, (err: any, user: Member) => {
        if (err) {
          return reject(err);
        } else if (user.isEnrolled()) {
          return resolve(user);
        } else {
          return reject(new BlockchainUserError('user is not yet registered and enrolled'));
        }
      });
    });
  }

  protected abstract doRequest(blockchainUser: Member, request: any): TransactionContext;

  protected abstract processResults(results: any): any;
}