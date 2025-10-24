  // src/app/services/auth.interceptor.ts
  import { HttpInterceptorFn } from '@angular/common/http';
  import { inject } from '@angular/core';
  import { AuthService } from './auth-service';

  export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService: AuthService = inject(AuthService);
    const authToken = authService.getToken();

    // If a token exists, clone the request and add the authorization header
    if (authToken) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
      return next(authReq);
    }

    // If no token, pass the original request along
    return next(req);
  };