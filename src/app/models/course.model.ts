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
  attachmentURL?: string | null;
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
  attachmentURL?: string | null;
  lessonAttachmentUrl?: string | null;     // Replaced attachmentURL
  lessonAttachmentFileName?: string | null; // Added file name field  
}

// Matches the structure of the C# CourseListDto sent by the backend API
export interface CourseListDto {
    courseID: number;
    title: string;          // Maps to Course.name
    published: boolean;     // Maps to Course.status
    totalLessons: number;   // Maps to Course.lessons
    totalDurationDisplay: string; // Maps to Course.totalTime
    courseCategory: string;
}

export interface CourseCategory {
  categoryID: number;
  name: string;
  description: string;
}

export interface CourseFormState {
  courseID: number | null; 
  instructorId: number | null;
  title: string;
  description: string;
  syllabus: string;
  thumbnailURL: string;
  level: 'Beginner' | 'Intermediate' | 'Expert' | string; 
  language: string; 
  duration: number | null; 
  categoryID: number | null; // Using model's correct categoryID
  categoryName: string | null;
  categoryDescription: string | null;
  status: 'Draft' | 'Published'; // Local UI state
courseMaterialFile?: File | null;
courseMaterialUrl?: string | null;

}

/**
 * Interface for the component's local Lesson list and form data.
 * It augments the base Lesson DTO with local client-side fields (File objects, flags).
 * Note: Uses lessonID for the primary key for consistency.
 */
export interface LessonFormState {
  lessonID?: number | null; // 👈 CRITICAL FIX: Primary key must be lessonID
  courseID: number | null; // 👈 CRITICAL FIX: Foreign key must be courseID
  title: string;
  content: string; 
  lessonType: 'Video';
  estimatedTime: number | null;
  orderIndex: number; 
  videoURL: string; 
  includeDocument: boolean;
//   attachmentFileUrl: string | null; 
  attachmentFile?: File | null; // Client-side file object
  lessonAttachmentUrl?: string | null;     // Replaced attachmentURL
  lessonAttachmentFileName?: string | null; // Added file name field  
}

export interface CreateCourseDto {
  title: string;
  description: string;
  syllabus?: string;
  level?: string;
  language?: string;
  duration?: number | null; 
  thumbnailURL?: string;
  categoryID: number;
  published: boolean;
}