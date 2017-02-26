import {Request} from 'express';
import * as jwt from 'jsonwebtoken';

export class JSONWebToken {
  private decodedToken: any;

  public constructor(request: Request) {
    this.decodedToken = jwt.decode(JSONWebToken.getTokenFromRequest(request));
  }

  public getUsername(): string {
    return this.decodedToken ? this.decodedToken.username : null;
  }

  public getUserID(): string {
    return this.decodedToken ? this.decodedToken.userID : null;
  }

  public static getTokenFromRequest(request: Request): string {
    let token = request.headers['x-access-token'];
    if (!token) {
      token = request.body ? request.body.token : null;
    }
    if (!token) {
      token = request.query ? request.query.token : null;
    }

    return token;
  }
}