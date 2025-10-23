// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environment';

export interface DecodedToken {
  userId: number
  role: string;
  // Add other properties as needed
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


// ✨ NEW: A private helper method for redirection
  private handleLogin(token: string): void {
    localStorage.setItem('auth_token', token);
    const userRole = this.getUserRole();

    if (userRole === 'Admin') {
      this.router.navigate(['/admin']);
    } else if (userRole === 'Instructor') {
      this.router.navigate(['/instructor']);
    } 
    else if (userRole === 'Student') {
      this.router.navigate(['/student']);
    }
    else {
      this.router.navigate(['/home']);
    }
  }

  // Method to get the token from localStorage
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Check if the user is currently authenticated
  isLoggedIn(): boolean {
    return !!this.getToken(); // Returns true if a token exists
  }

  // Login method: sends credentials to the backend
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/login`, credentials).pipe(
      tap(response => {
        // On successful login, store the token
        // console.log('Login response:', response.accessToken);
        localStorage.setItem('auth_token', response.accessToken);
        this.handleLogin(response.accessToken);
      })
    );
  }

 // ✨ NEW: Register method
  register(userDetails: { name: string, email: string, password: string }): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/register`, userDetails).pipe(
      // We use the same 'tap' operator to automatically log the user in
      tap(response => {
        localStorage.setItem('auth_token', response.accessToken);
        this.handleLogin(response.accessToken);
      })
    );
  }

  registerInstructor(userDetails: { name: string, email: string, password: string }): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/register/instructor`, userDetails).pipe(
      // We use the same 'tap' operator to automatically log the user in
      tap(response => {
        localStorage.setItem('auth_token', response.accessToken);
        this.handleLogin(response.accessToken);
      })
    );
  }

  // Logout method: removes the token and redirects
  logout(): void {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  // ✨ NEW: Method to get user's role from the token
  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedTokenrole: DecodedToken = jwtDecode(token);
        return decodedTokenrole.role;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }
}