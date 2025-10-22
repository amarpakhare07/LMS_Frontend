// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs'; // <-- Import BehaviorSubject
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environment';

export interface DecodedToken {
  userId: number;
  role: string;
  name: string;  // <-- Added for navbar
  email: string; // <-- Added for consistency
  // Add other properties as they appear in your JWT payload
}

export interface AuthResponse {
  accessToken: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl // Your API URL

  // --- NEW: Observables for Navbar ---
  // Create subjects to hold the current state
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserSubject = new BehaviorSubject<DecodedToken | null>(this.getDecodedUser());

  // Expose observables for components to subscribe to
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();
  // --- END NEW ---

  // Private helper to check for token on service initialization
  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  
getCurrentUserId(): number | null {
  return this.currentUserSubject.value?.userId ?? null;
}


  // Private helper to get decoded user on service initialization
  private getDecodedUser(): DecodedToken | null {
    const token = this.getToken();
    if (token) {
      try {
        return jwtDecode(token);
      } catch (error) {
        console.error('Error decoding token on init:', error);
        localStorage.removeItem('auth_token'); // Clear invalid token
        return null;
      }
    }
    return null;
  }

  // ✨ UPDATED: handleLogin now updates the observables
  private handleLogin(token: string): void {
    localStorage.setItem('auth_token', token);
    
    try {
      const user = jwtDecode<DecodedToken>(token);
      
      // --- NEW: Push updates to all subscribed components ---
      this.isLoggedInSubject.next(true);
      this.currentUserSubject.next(user);
      // --- END NEW ---

      // Redirect based on role
      if (user.role === 'Admin') {
        this.router.navigate(['/admin']);
      } else if (user.role === 'Instructor') {
        this.router.navigate(['/instructor']);
      } else {
        this.router.navigate(['/home']);
      }
    } catch (error) {
      console.error('Failed to decode token after login:', error);
      this.logout(); // Log out if token is invalid
    }
  }

  // Method to get the token from localStorage
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Check if the user is currently authenticated (synchronous)
  // This is still useful for guards
  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value; 
  }

  // Login method: sends credentials to the backend
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/login`, credentials).pipe(
      tap(response => {
        // This will now handle redirection AND update observables
        this.handleLogin(response.accessToken);
      })
    );
  }

  // Register method
  register(userDetails: { name: string, email: string, password: string }): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/register`, userDetails).pipe(
      tap(response => {
        this.handleLogin(response.accessToken);
      })
    );
  }

  registerInstructor(userDetails: { name: string, email: string, password: string }): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/register/instructor`, userDetails).pipe(
      tap(response => {
        this.handleLogin(response.accessToken);
      })
    );
  }

  // ✨ UPDATED: Logout method now updates the observables
  logout(): void {
    localStorage.removeItem('auth_token');
    
    // --- NEW: Push updates to all subscribed components ---
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    // --- END NEW ---

    this.router.navigate(['/login']);
  }

  // ✨ UPDATED: Method to get user's role (now from the subject)
  getUserRole(): string | null {
    // This is now faster as it reads from memory
    return this.currentUserSubject.value?.role || null;
  }
}