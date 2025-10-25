import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { Quiz, StartQuizResponse } from '../models/quiz.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = `${environment.apiUrl}/Quiz`;

  constructor(private http: HttpClient) {}

  getQuizzesByCourse(courseId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(
      `${this.apiUrl}/get-by-courseId/${courseId}`,
      { headers: this.getHeaders() }
    );
  }

  getQuizById(quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(
      `${this.apiUrl}/get-by-quizId/${quizId}`,
      { headers: this.getHeaders() }
    );
  }

  startQuiz(quizId: number): Observable<StartQuizResponse> {
    return this.http.post<StartQuizResponse>(
      `${this.apiUrl}/start/${quizId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  private getHeaders(): HttpHeaders {
    // ✅ FIXED: Changed from 'authToken' to 'auth_token'
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
}
