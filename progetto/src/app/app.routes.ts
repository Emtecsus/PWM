import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.page').then( m => m.SignupPage)
  },
  {
    path: 'rules',
    loadComponent: () => import('./rules/rules.page').then( m => m.RulesPage)
  },
    {
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  {
    path: 'account-settings',
    loadComponent: () => import('./account-settings/account-settings.page').then( m => m.AccountSettingsPage)
  },
  {
    path: 'tutorial',
    loadComponent: () => import('./tutorial/tutorial.page').then( m => m.TutorialPage)
  },
];

