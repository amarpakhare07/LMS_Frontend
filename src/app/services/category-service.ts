// src/app/services/category-service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/interfaces'; // adjust path if needed

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'https://localhost:7049/api/CourseCategories';

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    // ensure your backend endpoint returns categories with courses
    return this.http.get<Category[]>(this.baseUrl);
  }
}