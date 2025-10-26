export interface Quiz {
  quizID: number;
  courseID: number;
  title: string;
  totalMarks: number | null;
  timeLimit: number | null;
  createdAt: Date;
  attemptsAllowed: number | null;
}

export interface StartQuizResponse {
  courseID: any;
  quizID: number;
  title: string;
  totalMarks: number | null;
  timeLimit: number | null;
  attemptsAllowed: number | null;
  currentAttemptNumber: number;
  remainingAttempts: number | null;
}

export interface CreateQuizDto {
  courseID: number;
  title: string;
  totalMarks?: number;
  timeLimit?: number;
  attemptsAllowed?: number;
}