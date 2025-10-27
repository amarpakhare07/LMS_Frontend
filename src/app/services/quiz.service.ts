import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environment';
import { CreateQuizRequest, CreateQuizResponse, Quiz, StartQuizResponse } from '../models/quiz.model';
import { CreateQuestionRequest } from '../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = `${environment.apiUrl}/Quiz`;
  private apiUrlQuestion = `${environment.apiUrl}/Question`;

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


createQuiz(payload: CreateQuizRequest): Observable<number> {
    return this.http.post<CreateQuizResponse>(`${this.apiUrl}`, payload).pipe(
      map((res) => {
        // Try common id keys: id, quizId, quizID
        const id = (res?.id ?? res?.quizId ?? res?.quizID);
        if (typeof id !== 'number') {
          console.warn('CreateQuiz response did not include a numeric id. Full response:', res);
          throw new Error('Quiz ID not found in response. Ensure API returns { id } or { quizId }.');
        }
        return id;
      })
    );
  }

  
/** POST /api/Question/{quizId} */
  createQuestion(quizId: number, payload: CreateQuestionRequest) {
    return this.http.post(`${this.apiUrlQuestion}/${quizId}`, payload);
  }

  
/** === Management APIs === */
  getQuizzes(): Observable<Quiz[]> {
    const quizList: Observable<Quiz[]> = this.http.get<Quiz[]>(`${this.apiUrl}/all`);
    console.log('Fetching all quizzes from', `${this.apiUrl}/all`, quizList);
    return quizList;
  }

  getQuiz(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${id}`);
  }

  updateQuiz(id: number, payload: Partial<Omit<Quiz, 'id'>>): Observable<Quiz> {
    // Assumes PUT /api/Quiz/{id}; change to PATCH if your API uses partial updates via PATCH
    return this.http.put<Quiz>(`${this.apiUrl}/${id}`, payload);
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
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
