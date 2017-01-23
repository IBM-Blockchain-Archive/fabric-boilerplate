import {Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private router: Router) { }

  public canActivate(): boolean {
    if (localStorage.getItem('currentUser')) {
      return true;
    }

    this.router.navigateByUrl('/login');

    return false;
  }
}
