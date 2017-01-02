import {BlockchainClient} from '../blockchain/client/blockchainClient';
import {LoggerInstance} from 'winston';
import {Password} from '../utils/Password';
import {UserAuthenticator} from './UserAuthenticator';
import {BlockchainUserError} from '../utils/BlockchainUserError';

export class ClientAuthenticator extends UserAuthenticator {
  public constructor(private logger: LoggerInstance,
                     private username: string,
                     private password: string,
                     private blockchainClient: BlockchainClient) {
    super();
  }

  public async authenticate(): Promise<any> {
    this.logger.debug('Login attempt with username: ', this.username);

    let client: any;
    try {
      client = await this.blockchainClient.query('get_client', [this.username], this.username);
    } catch (error) {
      if (typeof error === typeof BlockchainUserError) {
        return {
          success: false,
          message: 'Authentication failed. User or password is incorrect.'
        };
      }
    }

    if (!client) {
      return {
        success: false,
        message: 'Authentication failed. User or password is incorrect.'
      };
    }

    const args = [this.username, new Password(this.password, client.salt).toHash()];

    let authenticationResultClient: AuthenticationResultClient = await this.blockchainClient.query('authenticateAsClient', args, this.username);
    if (!authenticationResultClient.Authenticated || !authenticationResultClient.Client) {
      return {
        success: false,
        message: 'Authentication failed. User or password is incorrect.'
      };
    }

    if (!this.validPassword(authenticationResultClient.Client, this.password)) {
      return {
        success: false,
        message: 'Authentication failed. User or password is incorrect.'
      };
    }

    return {
      authenticated: authenticationResultClient.Authenticated,
      message:       null,
      token:         this.generateToken(authenticationResultClient.Client),
      user:          authenticationResultClient.Client
    };
  }
}

interface AuthenticationResultClient {
  Client: any;
  Authenticated: boolean;
}
