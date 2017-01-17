import {Component, OnInit} from '@angular/core';
import {Headers, Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {Router} from "@angular/router";
import {AuthenticationService} from './../../services/authentication.service'

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit {
  title = 'app works';

  constructor(private _http: Http,
              private _router: Router,
              private _authenticationService: AuthenticationService) {
  }

  ngOnInit() {
  }

  login(username: string, password: string) {
    this._authenticationService.login(username, password)
      .subscribe(result => {
        if (result === true) {
          this._router.navigate(['./things']);
        }
      });
  }
}
