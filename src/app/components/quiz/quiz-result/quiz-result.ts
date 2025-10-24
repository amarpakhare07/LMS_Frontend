import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AnswerResult } from '../../../models/answer.model';
import { QuizResultsService } from '../../../services/quiz-results.service';

@Component({
  selector: 'app-quiz-results',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule,
    MatIconModule, MatDividerModule, MatChipsModule
  ],
  templateUrl: './quiz-result.html',
  styleUrls: ['./quiz-result.scss']
})
export class QuizResultsComponent implements OnInit, OnDestroy {
  score: number = 0;
  totalMarks: number = 0;
  percentage: number = 0;
  answers: AnswerResult[] = [];
  attemptNumber: number = 1;
  quizTitle: string = '';
  courseId: number = 0;
  quizId: number = 0;
  correctAnswers: number = 0;
  incorrectAnswers: number = 0;
  grade: string = '';
  gradeColor: string = '';

  constructor(
    private router: Router,
    private quizResultsService: QuizResultsService
  ) {}

  ngOnInit() {
    // ✅ Get data from service
    const results = this.quizResultsService.getResults();

    if (!results) {
      console.error('No quiz results found');
      this.router.navigate(['/home']);
      return;
    }

    this.score = results.score;
    this.totalMarks = results.totalMarks;
    this.answers = results.answers;
    this.attemptNumber = results.attemptNumber;
    this.quizTitle = results.quizTitle;
    this.courseId = results.courseId;
    this.quizId = results.quizId;

    this.calculateResults();
  }

  ngOnDestroy() {
    this.quizResultsService.clearResults();
  }

  calculateResults() {
    this.percentage = this.totalMarks > 0
      ? Math.round((this.score / this.totalMarks) * 100)
      : 0;

    this.correctAnswers = this.answers.filter(a => a.isCorrect).length;
    this.incorrectAnswers = this.answers.filter(a => !a.isCorrect).length;

    if (this.percentage >= 90) {
      this.grade = 'A+';
      this.gradeColor = '#28a745';
    } else if (this.percentage >= 80) {
      this.grade = 'A';
      this.gradeColor = '#5cb85c';
    } else if (this.percentage >= 70) {
      this.grade = 'B';
      this.gradeColor = '#5bc0de';
    } else if (this.percentage >= 60) {
      this.grade = 'C';
      this.gradeColor = '#f0ad4e';
    } else if (this.percentage >= 50) {
      this.grade = 'D';
      this.gradeColor = '#ff9800';
    } else {
      this.grade = 'F';
      this.gradeColor = '#dc3545';
    }
  }

  getMotivationalMessage(): string {
    if (this.percentage >= 90) return '🎉 Outstanding! You\'re a star!';
    if (this.percentage >= 80) return '👏 Excellent work! Keep it up!';
    if (this.percentage >= 70) return '👍 Good job! You\'re doing well!';
    if (this.percentage >= 60) return '💪 Not bad! Keep practicing!';
    if (this.percentage >= 50) return '📚 You can do better! Review and try again!';
    return '🌟 Don\'t give up! Learning takes time!';
  }

  retakeQuiz() {
    if (this.courseId && this.quizId) {
      this.router.navigate([`/course/${this.courseId}/quiz/${this.quizId}/attempt`]);
    }
  }

  backToQuizList() {
    if (this.courseId) {
      this.router.navigate([`/course/${this.courseId}/quiz/list`]);
    }
  }

  shareResults() {
    const text = `I scored ${this.score}/${this.totalMarks} (${this.percentage}%) on ${this.quizTitle}!`;
    if (navigator.share) {
      navigator.share({ title: 'Quiz Results', text: text })
        .catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(text)
        .then(() => alert('Results copied to clipboard!'))
        .catch(() => alert('Failed to copy results.'));
    }
  }

  downloadCertificate() {
    alert('Certificate download feature coming soon!');
  }
}