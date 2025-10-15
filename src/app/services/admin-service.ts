// src/app/services/admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Course } from '../models/interfaces';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // --- User Methods ---
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/UserManagement/admin/users`);
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/UserManagement/admin/users/role/${role}`);
  }

  updateUserStatus(email: string, isActive: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/UserManagement/admin/users/status/${email}`, { isActive });
  }

  deleteUser(email: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/UserManagement/admin/users`, { body: { email } });
  }

  // --- Course Methods ---
  // getCourses(): Observable<Course[]> {
  //   return this.http.get<Course[]>(`${this.apiUrl}/UserManagement/admin/courses`);
  // }
}