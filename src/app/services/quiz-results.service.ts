import { Injectable } from '@angular/core';
import { AnswerResult } from '../models/answer.model';

export interface QuizResultsData {
  score: number;
  totalMarks: number;
  answers: AnswerResult[];
  attemptNumber: number;
  quizTitle: string;
  courseId: number;
  quizId: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuizResultsService {
  private resultsData: QuizResultsData | null = null;

  setResults(data: QuizResultsData): void {
    this.resultsData = data;
    // Also store in sessionStorage as backup
    sessionStorage.setItem('quizResults', JSON.stringify(data));
  }

  getResults(): QuizResultsData | null {
    // First try to get from memory
    if (this.resultsData) {
      return this.resultsData;
    }
    
    // If not in memory, try sessionStorage (in case of page refresh)
    const stored = sessionStorage.getItem('quizResults');
    if (stored) {
      try {
        this.resultsData = JSON.parse(stored);
        return this.resultsData;
      } catch (e) {
        console.error('Error parsing quiz results from storage:', e);
        return null;
      }
    }
    
    return null;
  }

  clearResults(): void {
    this.resultsData = null;
    sessionStorage.removeItem('quizResults');
  }
}