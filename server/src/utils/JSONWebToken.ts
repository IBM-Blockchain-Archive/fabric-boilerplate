'use strict';
import {Request} from 'express';
const jwt = require('jsonwebtoken');

export class JSONWebToken {
  private decodedToken: any;

  public constructor(request: Request) {
    this.decodedToken = jwt.decode(request.headers['x-access-token']);
  }

  public getUsername(): string {
    return this.decodedToken.username;
  }

  public getUserID(): string {
    if (this.decodedToken.userID) {
      return this.decodedToken.userID;
    } else {
      return undefined;
    }
  }
}