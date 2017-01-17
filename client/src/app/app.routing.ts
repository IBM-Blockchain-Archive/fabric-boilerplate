import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from './components/login/login.component'
import {ThingsComponent} from './components/things/things.component'

const appRoutes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'things', component: ThingsComponent},
  {path: '**', redirectTo: '/'}
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
