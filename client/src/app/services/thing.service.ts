import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import {Configuration} from '../app.constants';
import {AuthenticationService} from './authentication.service'

@Injectable()
export class ThingService {
  private actionUrl: string;
  private headers: any;

  constructor(private _http: Http,
              private _configuration: Configuration,
              private _authenticationService: AuthenticationService){
    this.actionUrl = `${_configuration.apiHost}${_configuration.apiPrefix}things`;
    this.headers = _authenticationService.createAuthorizationHeader();
  }

  public getThingsByUser() {
    let user: any = JSON.parse(localStorage.getItem('currentUser')).user;
    return this._http
      .get(this.actionUrl + '/' + user.userID, {headers: this.headers})
      .map(res => res.json());
  }
}
