import {Password} from './Password';
import {Config} from '../config';
import * as jsonwebtoken from 'jsonwebtoken';

export class UserAuthenticator {
  private TOKEN_LIFETIME_IN_SECONDS: number = 24 * 60 * 60;

  public validPassword(user: any, password: string): boolean {
    return new Password(password, user.salt).toHash() === user.hash;
  }

  public generateToken(user: any): string {
    return jsonwebtoken.sign(user, new Config().getSecret(), {
      expiresIn: this.TOKEN_LIFETIME_IN_SECONDS
    });
  }
}