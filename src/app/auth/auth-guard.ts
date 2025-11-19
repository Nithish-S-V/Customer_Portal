import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Only check localStorage in browser environment
  if (isPlatformBrowser(platformId)) {
    // Check if JWT token exists in localStorage
    const token = localStorage.getItem('jwt_token');
    
    if (token) {
      // Token exists, allow access
      return true;
    } else {
      // No token, redirect to login
      router.navigate(['/login']);
      return false;
    }
  }
  
  // On server, redirect to login by default
  router.navigate(['/login']);
  return false;
};
