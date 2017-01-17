import {BlockchainClient} from '../blockchain/client/blockchainClient';
import {LoggerInstance} from 'winston';
import {Password} from '../utils/Password';
import {UserAuthenticator} from '../utils/UserAuthenticator';
import {BlockchainUserError} from '../utils/BlockchainUserError';

export class ClientAuthenticator {
  public constructor(private logger: LoggerInstance,
                     private username: string,
                     private password: string,
                     private blockchainClient: BlockchainClient) { }

  public async authenticate(): Promise<any> {
    this.logger.debug('Login attempt with username: ', this.username);

    let user: any;
    try {
      user = await this.blockchainClient.query('getUser', [this.username], this.username);
    } catch (error) {
      if (typeof error === typeof BlockchainUserError) {
        return {
          success: false,
          message: 'Authentication failed. User or password is incorrect.'
        };
      }
    }

    if (!user) {
      console.log('not client error');
      return {
        success: false,
        message: 'Authentication failed. User or password is incorrect.'
      };
    }

    const args = [this.username, new Password(this.password, user.salt).toHash()];

    let authenticationResultClient: AuthenticationResultClient = await this.blockchainClient.query('authenticateAsUser', args, this.username);
    if (!authenticationResultClient.Authenticated || !authenticationResultClient.User) {
      return {
        success: false,
        message: 'Authentication failed. User or password is incorrect.'
      };
    }

    if (!new UserAuthenticator().validPassword(authenticationResultClient.User, this.password)) {
      return {
        success: false,
        message: 'Authentication failed. User or password is incorrect.'
      };
    }

    return {
      authenticated: authenticationResultClient.Authenticated,
      message:       null,
      token:         new UserAuthenticator().generateToken(authenticationResultClient.User),
      user:          authenticationResultClient.User
    };
  }
}

interface AuthenticationResultClient {
  User: any;
  Authenticated: boolean;
}