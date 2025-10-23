import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { Answer } from '../models/answer.model';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private apiUrl = `${environment.apiUrl}/Answer`;

  constructor(private http: HttpClient) {}

  submitAnswer(answer: Answer): Observable<Answer> {
    return this.http.post<Answer>(this.apiUrl, answer, {
      headers: this.getHeaders()
    });
  }

  private getHeaders(): HttpHeaders {
    // ✅ Changed to match AuthService token key
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
}