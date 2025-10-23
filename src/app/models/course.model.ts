export interface Course {
  courseID: number;
  title: string;
  description: string;
  syllabus?: string;
  level?: string;
  language?: string;
  duration?: number; 
  thumbnailURL?: string;
  categoryID?: number;
  published?: boolean;
  rating?: number;
  reviewCount?: number;
  lessons: Lesson[];
}

export interface Lesson {
  lessonID: number;
  courseID: number;
  title: string;
  content: string;
  videoURL: string;
  orderIndex: number;
  lessonType: string;
  estimatedTime: number;
  createdAt: string;
  updatedAt: string | null;
}