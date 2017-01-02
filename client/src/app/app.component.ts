import { Component, OnInit } from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app works';

  constructor(private http: Http) {}

  ngOnInit() {
    this.title = 'Testing...';
    let headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
    });
    this.http.post('http://localhost:8080/auth/login',
      JSON.stringify({ username: 'john', password: 'passw0rd' }), {headers})
      .map(res => res.json())
      .subscribe((res: any) => {
        this.title = res.authenticated;
        console.log(res);
      });
  }
}
