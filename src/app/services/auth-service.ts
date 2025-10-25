import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environment';
export interface DecodedToken {
nameid: string; // ✅ FIXED: Backend sends ‘nameid’ not ‘userId’
role: string;
name: string;
email: string;
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
private apiUrl = environment.apiUrl;
private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
private currentUserSubject = new BehaviorSubject<DecodedToken | null>(this.getDecodedUser());
public isLoggedIn$ = this.isLoggedInSubject.asObservable();
public currentUser$ = this.currentUserSubject.asObservable();
private hasToken(): boolean {
return !!localStorage.getItem('auth_token');
}
// ✅ FIXED: Parse nameid correctly
getCurrentUserId(): number | null {
const user = this.currentUserSubject.value;
if (user && user.nameid) {
return parseInt(user.nameid, 10);
}
return null;
}
private getDecodedUser(): DecodedToken | null {
const token = this.getToken();
if (token) {
try {
return jwtDecode(token);
} catch (error) {
console.error('Error decoding token on init:', error);
localStorage.removeItem('auth_token');
return null;
}
}
return null;
}
private handleLogin(token: string): void {
localStorage.setItem('auth_token', token);

try {
 const user = jwtDecode<DecodedToken>(token);
 this.isLoggedInSubject.next(true);
 this.currentUserSubject.next(user);
 if (user.role === 'Admin') {
   this.router.navigate(['/admin']);
 } else if (user.role === 'Instructor') {
   this.router.navigate(['/instructor']);
 } else {
   this.router.navigate(['/home']);
 }
} catch (error) {
 console.error('Failed to decode token after login:', error);
 this.logout();
}

}
getToken(): string | null {
return localStorage.getItem('auth_token');
}
isLoggedIn(): boolean {
return this.isLoggedInSubject.value;
}
login(credentials: { email: string, password: string }): Observable<any> {
return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/login`, credentials).pipe(
tap(response => {
this.handleLogin(response.accessToken);
})
);
}
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
logout(): void {
localStorage.removeItem('auth_token');

this.isLoggedInSubject.next(false);
this.currentUserSubject.next(null);
this.router.navigate(['/login']);
}
getUserRole(): string | null {
return this.currentUserSubject.value?.role || null;
}
}
