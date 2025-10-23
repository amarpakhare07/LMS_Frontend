
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { Question } from '../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = `${environment.apiUrl}/Question`;

  constructor(private http: HttpClient) {}

  getQuestionsByQuiz(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/quiz/${quizId}`, {
      headers: this.getHeaders()
    });
  }

  getQuestionById(questionId: number): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/${questionId}`, {
      headers: this.getHeaders()
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
}