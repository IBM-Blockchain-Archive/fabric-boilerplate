import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {routing, appRoutingProviders} from './app.routing';
import {Configuration} from './app.constants';

import {AuthGuard} from './guards/index';

import {AppComponent} from './app.component';
import {LoginComponent} from './components/login/login.component';
import {ThingsComponent} from './components/things/things.component';

import {ThingService} from './services/thing.service';
import {AuthenticationService} from './services/authentication.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ThingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [
    appRoutingProviders,
    Configuration,
    AuthenticationService,
    AuthGuard,
    ThingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
