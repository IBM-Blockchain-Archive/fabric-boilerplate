import {ChaincodeBluemixConfig} from './ChaincodeBluemixConfig';
import {ChaincodeLocalConfig} from './ChaincodeLocalConfig';
import {BlockchainBluemix} from './BlockchainBluemix';
import {BlockchainLocal} from './BlockchainLocal';
import {Blockchain} from './Blockchain';
import {LoggerInstance} from 'winston';

export class BlockchainFactory {
  public static create(logger: LoggerInstance, serverDirectory: string): Blockchain {
    if (process.env.NODE_ENV === 'production') {
      return new BlockchainBluemix(logger, serverDirectory, new ChaincodeBluemixConfig().getConfiguration());
    } else {
      return new BlockchainLocal(logger, serverDirectory, new ChaincodeLocalConfig().getConfiguration());
    }
  }
}