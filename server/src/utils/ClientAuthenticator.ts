import {BlockchainClient} from '../blockchain/client/blockchainClient';
import {LoggerInstance} from 'winston';
import {Password} from './Password';
import {UserAuthenticator} from './UserAuthenticator';
import {BlockchainUserError} from './BlockchainUserError';

export class ClientAuthenticator {
  public constructor(private logger: LoggerInstance,
                     private username: string,
                     private password: string,
                     private blockchainClient: BlockchainClient) { }

  public async authenticate(): Promise<AuthenticationResponse> {
    this.logger.debug('Login attempt with username: ', this.username);

    let user: any;
    try {
      user = await this.blockchainClient.query('getUser', [this.username], this.username);
    } catch (error) {
      if (typeof error === typeof BlockchainUserError) {
        return <AuthenticationResponse>{
          success: false,
          message: 'Authentication failed. User or password is incorrect.'
        };
      }
    }

    if (!user) {
      console.log('not client error');
      return <AuthenticationResponse>{
        success: false,
        message: 'Authentication failed. User or password is incorrect.'
      };
    }

    const args = [this.username, new Password(this.password, user.salt).toHash()];

    let authenticationResultClient: AuthenticationResultClient = await this.blockchainClient.query('authenticateAsUser', args, this.username);
    if (!authenticationResultClient.Authenticated || !authenticationResultClient.User) {
      return <AuthenticationResponse>{
        success: false,
        message: 'Authentication failed. User or password is incorrect.'
      };
    }

    if (!new UserAuthenticator().validPassword(authenticationResultClient.User, this.password)) {
      return <AuthenticationResponse>{
        success: false,
        message: 'Authentication failed. User or password is incorrect.'
      };
    }

    return <AuthenticationResponse>{
      success:       authenticationResultClient.Authenticated,
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

export interface AuthenticationResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any; // TODO type
}