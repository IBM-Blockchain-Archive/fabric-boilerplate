'use strict';

import * as crypto from 'crypto';
import {Password} from '../utils/Password';

export class Client {
  private _clientID: string;
  private _salt: string;
  private _hash: string;
  private _username: string;

  public constructor(clientID: string, password: string, username: string) {
    this._clientID   = clientID;
    this._username   = username;
    this._salt       = crypto.randomBytes(16).toString('hex');
    this._hash       = new Password(password, this.salt).toHash();
  }

  public get clientID(): string {
    return this._clientID;
  }

  public get salt(): string {
    return this._salt;
  }

  public get hash(): string {
    return this._hash;
  }

  public get username(): string {
    return this._username;
  }

  public toJSON(): any {
    return {
      'clientID':   this.clientID,
      'salt':       this.salt,
      'hash':       this.hash,
      'username':   this.username
    };
  }
}