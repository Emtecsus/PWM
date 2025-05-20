import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  
  if (!token || token.trim() === '') { // controllo se il token è valido o vuoto
    router.navigateByUrl('/login'); // meglio usare navigateByUrl per le guardie
    return false;
  }

  return true;
};
