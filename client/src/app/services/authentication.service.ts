import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {Observable} from 'rxjs';
import {Configuration} from '../app.constants';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthenticationService {
  public actionUrl: string;
  public token: string;
  private TOKEN_KEY = 'token';
  public user: any;

  public constructor(private _http: Http,
                     private _configuration: Configuration) {
    this.actionUrl = _configuration.Server + 'auth/login';
    // set token if saved in local storage
    this.token = this.getToken();
  }

  public login(username: string, password: string): Observable<any> {
    return this._http.post(this.actionUrl, {username: username, password: password})
      .map((response: Response) => {
        let user = response.json() && response.json().user;
        // +login successful if there's a jwt token in the response
        let token = response.json() && response.json().token;
        if (token) {
          // set token property
          this.token = token;

          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem(this.TOKEN_KEY, JSON.stringify({token}));
          localStorage.setItem('currentUser', JSON.stringify({user}));

          // return true to indicate successful +login
          return true;
        } else {
          // return false to indicate failed +login
          return false;
        }
      }).catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  public logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem(this.TOKEN_KEY);
  }

  public createAuthorizationHeader(): Headers {
    let headers = new Headers();
    headers.append('x-access-token', this.getToken());
    headers.append('Content-Type', 'application/json');
    return headers;
  }

  private getToken(): string {
    let userToken = JSON.parse(localStorage.getItem(this.TOKEN_KEY));
    return userToken ? userToken.token : null;
  }
}
