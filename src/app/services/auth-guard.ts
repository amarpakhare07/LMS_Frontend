// src/app/services/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth-service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Check if the user is logged in
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Get the expected role from the route data
  const expectedRole = route.data['expectedRole'];
  
  // If no specific role is required for the route, allow access
  if (!expectedRole) {
    return true;
  }

  // 3. Get the current user's role
  const currentUserRole = authService.getUserRole();
    // console.log(`Guard Check -> Expected: '${expectedRole}', User Has: '${currentUserRole}'`);

  // 4. Compare roles and grant or deny access
  if (currentUserRole === expectedRole) {
    return true; // User has the required role, allow access
  } else {
    // Redirect to an unauthorized/access-denied page or back to the dashboard
    router.navigate(['/unauthorized']); // Or a dedicated '/unauthorized' page
    return false;
  }
};