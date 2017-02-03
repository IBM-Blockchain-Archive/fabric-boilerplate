import {Component, OnInit} from '@angular/core';
import 'rxjs/add/operator/map';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  title = 'app works';

  constructor(private _router: Router,
              private _authenticationService: AuthenticationService) {
  }

  public ngOnInit(): void {
    // reset login status
    this._authenticationService.logout();
  }

  public login(username: string, password: string) {
    this._authenticationService.login(username, password)
      .subscribe(result => {
        if (result) {
          this._router.navigate(['./things']);
        }
      });
  }
}
