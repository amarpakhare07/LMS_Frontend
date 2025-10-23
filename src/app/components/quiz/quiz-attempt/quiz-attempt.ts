import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { QuizService } from '../../../services/quiz.service';
import { QuestionService } from '../../../services/question.service';
import { AnswerService } from '../../../services/answer.service';
import { QuizScoreService } from '../../../services/quiz-score.service';
import { QuizResultsService } from '../../../services/quiz-results.service';
import { Question } from '../../../models/question.model';
import { Answer, AnswerResult } from '../../../models/answer.model';
import { StartQuizResponse } from '../../../models/quiz.model';
import { interval, Subscription } from 'rxjs';
import { QuizScore } from '../../../models/quiz-score.model';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatRadioModule,
    MatProgressBarModule,
    MatIconModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './quiz-attempt.html',
  styleUrls: ['./quiz-attempt.scss']
})
export class QuizAttemptComponent implements OnInit, OnDestroy {
  quizId!: number;
  courseId!: number;
  quizData!: StartQuizResponse;
  questions: Question[] = [];
  currentQuestionIndex = 0;
  selectedAnswer: string = '';
  answersHistory: AnswerResult[] = [];
  totalScore = 0;
  loading = true;
  submitting = false;
  showFeedback = false;
  lastAnswerCorrect = false;
  lastMarksAwarded = 0;
  answerLocked = false;

  timeRemaining: number = 0;
  timerSubscription?: Subscription;
  timerDisplay = '00:00';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private questionService: QuestionService,
    private answerService: AnswerService,
    private quizScoreService: QuizScoreService,
    private quizResultsService: QuizResultsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.quizId = +params['quizId'];
      this.courseId = +params['courseId'];
      
      if (this.quizId && this.courseId) {
        this.initializeQuiz();
      } else {
        this.showError('Invalid quiz or course ID');
      }
    });
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  initializeQuiz() {
    this.loading = true;
    this.quizService.startQuiz(this.quizId).subscribe({
      next: (response) => {
        console.log('Quiz started:', response);
        this.quizData = response;
        this.timeRemaining = (response.timeLimit ?? 0) * 60;
        this.startTimer();
        this.loadQuestions();
      },
      error: (error) => {
        console.error('Error starting quiz:', error);
        this.showError('Failed to start quiz. Please try again.');
        this.loading = false;
      }
    });
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  loadQuestions() {
    this.questionService.getQuestionsByQuiz(this.quizId).subscribe({
      next: (questions) => {
        console.log('Questions loaded:', questions);
        if (questions && questions.length > 0) {
          this.questions = questions;
          this.loading = false;
          this.updateTimerDisplay();
        } else {
          this.showError('No questions found for this quiz');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        this.showError('Failed to load questions');
        this.loading = false;
      }
    });
  }

  startTimer() {
    this.updateTimerDisplay();
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();
      if (this.timeRemaining <= 0) {
        this.timeUp();
      }
    });
  }

  stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    this.timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  timeUp() {
    this.stopTimer();
    this.snackBar.open('⏰ Time is up! Submitting quiz…', 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
    setTimeout(() => this.submitQuiz(), 1000);
  }

  get currentQuestion(): Question | undefined {
    return this.questions[this.currentQuestionIndex];
  }

  get progress(): number {
    return this.questions.length > 0
      ? ((this.currentQuestionIndex + 1) / this.questions.length) * 100
      : 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  submitAnswer() {
    if (!this.selectedAnswer) {
      this.snackBar.open('⚠️ Please select an answer first', 'Close', {
        duration: 2000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    if (this.answerLocked) {
      return;
    }

    this.answerLocked = true;
    this.submitting = true;

    const answer: Answer = {
      questionID: this.currentQuestion!.questionID,
      response: this.selectedAnswer,
      quizID: this.quizId,
      attemptNumber: this.quizData.currentAttemptNumber
    };

    console.log('Submitting answer:', answer);

    this.answerService.submitAnswer(answer).subscribe({
      next: (result) => {
        console.log('Answer result:', result);
        this.submitting = false;
        this.showFeedback = true;
        this.lastAnswerCorrect = !!result.isCorrect;
        this.lastMarksAwarded = result.marksAwarded || 0;

        this.answersHistory.push({
          questionID: result.questionID,
          questionText: this.currentQuestion!.questionText,
          response: result.response,
          quizID: result.quizID,
          attemptNumber: result.attemptNumber,
          isCorrect: result.isCorrect || false,
          marksAwarded: result.marksAwarded || 0,
          totalMarks: this.currentQuestion!.marks
        });

        this.totalScore += result.marksAwarded || 0;
        this.showAnswerFeedback();
      },
      error: (error) => {
        console.error('Error submitting answer:', error);
        this.showError('Failed to submit answer. Please try again.');
        this.submitting = false;
        this.answerLocked = false;
      }
    });
  }

  showAnswerFeedback() {
    const message = this.lastAnswerCorrect
      ? `✅ Correct! You earned ${this.lastMarksAwarded} marks`
      : `❌ Incorrect! Correct answer will be shown`;
    const panelClass = this.lastAnswerCorrect ? ['success-snackbar'] : ['error-snackbar'];

    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: panelClass
    });
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = '';
      this.showFeedback = false;
      this.answerLocked = false;
    }
  }

  submitQuiz() {
    this.submitting = true;

    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      this.showError('User not authenticated. Please login again.');
      this.submitting = false;
      this.router.navigate(['/login']);
      return;
    }

    const quizScore: QuizScore = {
      quizID: this.quizId,
      userID: userId,
      attemptNumber: this.quizData.currentAttemptNumber
    };

    console.log('Submitting quiz payload:', quizScore);

    this.quizScoreService.submitQuizScore(quizScore).subscribe({
      next: (response) => {
        console.log('Submit response:', response);

        // ✅ CRITICAL FIX: Store results in a SERVICE instead of router state
        this.quizResultsService.setResults({
          score: response.score,
          totalMarks: this.quizData.totalMarks || 0,
          answers: this.answersHistory,
          attemptNumber: response.attemptNumber || quizScore.attemptNumber,
          quizTitle: this.quizData.title,
          courseId: this.courseId,
          quizId: this.quizId
        });

        // Navigate to results WITHOUT state
        this.router.navigate([`/course/${this.courseId}/quiz/results`]);
      },
      error: (error) => {
        console.error('Quiz submit failed:', error);
        this.showError('Failed to submit quiz. Your answers are saved.');
        this.submitting = false;
      }
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  goBack() {
    if (confirm('Are you sure? Your progress will be lost.')) {
      this.stopTimer();
      this.router.navigate([`/course/${this.courseId}/quiz/list`]);
    }
  }
}