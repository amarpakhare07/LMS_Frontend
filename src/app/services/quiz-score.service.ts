import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { QuizScore, QuizScoreResponse } from '../models/quiz-score.model';

@Injectable({ providedIn: 'root' })
export class QuizScoreService {
  private apiUrl = `${environment.apiUrl}/QuizScore`;

  constructor(private http: HttpClient) {}

  submitQuizScore(quizScore: QuizScore): Observable<QuizScoreResponse> {
    return this.http.post<QuizScoreResponse>(
      `${this.apiUrl}/submit`,
      quizScore,
      { headers: this.getHeaders() }
    );
  }

  getQuizScoresByCourse(courseId: number): Observable<QuizScoreResponse[]> {
    return this.http.get<QuizScoreResponse[]>(
      `${this.apiUrl}/course/${courseId}`,
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
