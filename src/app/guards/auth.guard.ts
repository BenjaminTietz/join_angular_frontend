import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token'); // Check for the token
  if (token) {
    return true; // Token exists, allow access
  } else {
    // Token does not exist, redirect to login
    const router = inject(Router);
    router.navigate(['/']); // Change this to your login route
    return false; // Deny access
  }
};
