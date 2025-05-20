import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

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
    canActivate: [authGuard], // protetta
    loadComponent: () => import('./rules/rules.page').then( m => m.RulesPage)
  },
    {
    path: 'home',
    canActivate: [authGuard], // protetta
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  {
    path: 'account-settings',
    canActivate: [authGuard], // protetta
    loadComponent: () => import('./account-settings/account-settings.page').then( m => m.AccountSettingsPage)
  },
  {
    path: 'tutorial',
    canActivate: [authGuard], // protetta
    loadComponent: () => import('./tutorial/tutorial.page').then( m => m.TutorialPage)
  },
];

