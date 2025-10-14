// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'https://localhost:7049/api'; // Your API URL

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
    return this.http.post<{ token: string }>(`${this.apiUrl}/Auth/login`, credentials).pipe(
      tap(response => {
        // On successful login, store the token
        localStorage.setItem('auth_token', response.token);
        this.router.navigate(['/dashboard']); // Redirect to a protected route
      })
    );
  }

 // ✨ NEW: Register method
  register(userDetails: { name: string, email: string, password: string }): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/register`, userDetails).pipe(
      // We use the same 'tap' operator to automatically log the user in
      tap(response => {
        localStorage.setItem('auth_token', response.token);
        this.router.navigate(['/dashboard']);
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
        const decodedToken: { role: string } = jwtDecode(token);
        return decodedToken.role;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }
}