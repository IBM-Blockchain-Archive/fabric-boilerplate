import {Blockchain} from './Blockchain';
import {ChaincodeEnvironmentConfiguration} from './ChaincodeEnvironmentConfiguration';
import {LoggerInstance} from 'winston';
import * as path from 'path';
import {newFileKeyValStore, Chain} from 'hfc/lib/hfc';

export class BlockchainLocal extends Blockchain {
  private chaincodePath: string;

  public constructor(logger: LoggerInstance,
                     serverDirectory: string,
                     chaincodeEnvironmentConfiguration: ChaincodeEnvironmentConfiguration) {
    super(logger, serverDirectory, chaincodeEnvironmentConfiguration);
    this.chaincodePath = chaincodeEnvironmentConfiguration.chaincode.path;

    logger.info('[SDK] Running in local mode');
  }

  protected async configureChain(chain: Chain, ca: any, peer: any): Promise<Chain> {
    return new Promise<Chain>(async(resolve: (chain: Chain) => void, reject: (error: Error) => void) => {
      chain.setKeyValStore(newFileKeyValStore(path.join(this.serverDirectory, this.chaincodeEnvironmentConfiguration.chaincode.keyValStorePath)));

      // Connect to memberservice and peer
      let membersrvcAddr = 'grpc://' + process.env.MEMBERSRVC_ADDR || ca.url;
      let peerAddr       = 'grpc://' + process.env.PEER_ADDR || `${peer.discovery_host}:${peer.discovery_port}`;

      chain.setMemberServicesUrl(membersrvcAddr);
      chain.addPeer(peerAddr);
      this.logger.info('[SDK]', membersrvcAddr, peerAddr);

      return resolve(chain);
    });
  }
}