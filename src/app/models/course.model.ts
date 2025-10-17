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
}