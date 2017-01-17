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
    this.actionUrl = _configuration.Server + 'api/v1/things';
    this.headers = _authenticationService.createAuthorizationHeader();
  }

  getThings() {
    return this._http
      .get(this.actionUrl + '/john', {headers: this.headers})
      .map(res => res.json());
  }
}