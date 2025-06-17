import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
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
    path: 'tutorial',
    canActivate: [authGuard], // protetta
    loadComponent: () => import('./tutorial/tutorial.page').then( m => m.TutorialPage)
  },
  {
    path: 'game',
    canActivate: [authGuard], // protetta
    loadComponent: () => import('./game/game.page').then( m => m.GamePage)
  },
];

