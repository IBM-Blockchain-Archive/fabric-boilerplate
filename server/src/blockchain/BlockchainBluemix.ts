import {Blockchain} from './Blockchain';
import {ChaincodeEnvironmentConfiguration} from './ChaincodeEnvironmentConfiguration';
import {LoggerInstance} from 'winston';
import * as path from 'path';
import {newFileKeyValStore, Chain, GRPCOptions} from 'hfc/lib/hfc';
import * as fs from 'fs';
import * as https from 'https';
import {IncomingMessage} from 'http';
import {WriteStream, Stats} from 'fs';

export class BlockchainBluemix extends Blockchain {
  private certFilename: string;
  private certFilename2: string;

  public constructor(logger: LoggerInstance,
                     serverDirectory: string,
                     chaincodeEnvironmentConfiguration: ChaincodeEnvironmentConfiguration) {
    super(logger, serverDirectory, chaincodeEnvironmentConfiguration);

    this.certFilename = path.join(this.serverDirectory, chaincodeEnvironmentConfiguration.chaincode.certPath);
    if (chaincodeEnvironmentConfiguration.chaincode.certPath2) {
      this.certFilename2 = path.join(this.serverDirectory, chaincodeEnvironmentConfiguration.chaincode.certPath2);
    }

    logger.info('[SDK] Running in bluemix mode');
  }

  protected async configureChain(chain: Chain, ca: any, peer: any): Promise<Chain> {
    return new Promise<Chain>(async(resolve: (chain: Chain) => void, reject: (error: Error) => void) => {
      // Set the key value store that holds the user certificates
      chain.setKeyValStore(newFileKeyValStore(path.join(this.serverDirectory, this.chaincodeEnvironmentConfiguration.chaincode.keyValStorePath)));
      chain.setECDSAModeForGRPC(true);
      chain.setDevMode(false);

      // Get the tls certificate, needed to connect to the Bluemix Blockchain service
      try {
        await this.downloadCertificate();
      } catch (err) {
        this.logger.error('[SDK] Error downloading certificate:', err);
        return reject(err);
      }

      let cert    = fs.readFileSync(this.certFilename);
      let options = <GRPCOptions>{pem: cert.toString()};

      // Connect to memberservice and peer
      chain.setMemberServicesUrl(`grpcs://${ca.url}`, options);
      chain.addPeer(`grpcs://${peer.discovery_host}:${peer.discovery_port}`, options);

      resolve(chain);
    });
  }

  // Download certificate from bluemix. Resolve if file exists.
  private downloadCertificate(): Promise<void> {
    return new Promise<void>((resolve: () => void, reject: (error: Error) => void) => {
      fs.stat(this.certFilename, (err: NodeJS.ErrnoException, stats: Stats) => {
        if (!err) {
          return resolve();
        }
        let file = <WriteStream>fs.createWriteStream(this.certFilename);
        https.get(this.chaincodeEnvironmentConfiguration.network.cert, (response: IncomingMessage) => {
          response.pipe(file).on('finish', () => {
            file.close();
            this.copyCert().then(resolve).catch(reject);
          });
        }).on('error', (err: Error) => { // Handle errors
          fs.unlink(this.certFilename); // Delete the file async. (But we don't check the result)
          reject(err);
        });
      });
    });
  }

  private async copyCert(): Promise<void> {
    if (!this.certFilename2) {
      return;
    }

    return new Promise<void>((resolve: () => void, reject: (error: Error) => void) => {
      let rd = fs.createReadStream(this.certFilename);
      rd.on('error', reject);
      let wr = fs.createWriteStream(this.certFilename2);
      wr.on('error', reject);
      wr.on('close', resolve);
      rd.pipe(wr);
    });
  }
}