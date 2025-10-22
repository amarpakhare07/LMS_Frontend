// src/app/guards/public.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';


export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // User is ALREADY logged in. Redirect them away.
    const role = authService.getUserRole();
    
    if (role === 'Admin') {
      router.navigate(['/admin']);
    } else if (role === 'Instructor') {
      router.navigate(['/instructor']);
    } else {
      router.navigate(['/home']); // Or your default logged-in page
    }
    
    return false; // Block access to the login/register page
  }

  // User is not logged in, allow access.
  return true;
};