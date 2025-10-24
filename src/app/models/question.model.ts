export interface Question {
  questionID: number;
  quizID: number;
  questionText: string;
  questionType: string;
  options: string[];
  marks: number;
  correctAnswer?: string;
}

export interface CreateQuestionDto {
  questionText: string;
  questionType: string;
  options: string[];
  marks: number;
  correctAnswer: string;
}
