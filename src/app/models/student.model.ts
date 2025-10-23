import { Course } from './course.model'; // Assumes Course interface is defined here

// export interface EnrolledCourse extends Course {
//   enrollmentId: number;
//   progressPercentage: number; // 0-100
//   lastAccessed: string; // ISO Date String
// }

export interface QuizAttemptSummary {
  quizAttemptId: number;
  quizId: number;
  courseTitle: string;
  score: number; // e.g., 85
  maxScore: number; // e.g., 100
  attemptDate: string; // ISO Date String
  isCompleted: boolean;
}

// export interface StudentDashboardSummary {
//   totalCourses: number;
//   completedCourses: number;
//   lastActiveCourses: EnrolledCourse[];
//   recentQuizAttempts: QuizAttemptSummary[];
//   overallProgress: number; // Overall average progress %
// }

// Placeholder model for the Quiz component
// export interface QuizQuestion {
//   questionId: number;
//   text: string;
//   type: 'multiple-choice' | 'true-false' | 'multi-select';
//   options: { id: number; text: string }[];
// }

export interface DashboardNavItem {
  label: string;
  path: string;
  icon: string;
}



export interface UserProfile {
    userId: number;
    name: string;
    email: string;
    bio: string; // The user's biography
    profilePicture: string; // The filename/URL for the picture
    role: number; // UserRole enum value (Admin: 3, Student: 1, etc.)
    lastLogin: Date | null;
    updatedAt: Date | null;
    isActive: boolean;
    isDeleted: boolean;
}

/**
 * Interface for the request body when updating the user's bio.
 * Maps to the UserUpdateProfileBioDto on the backend.
 */
export interface UpdateBioRequest {
    bio: string;
}


export interface EnrolledCourse {
  courseID: number;
  title: string;
  description?: string;
  level?: string;
  language?: string;
  duration?: number;
  thumbnailURL?: string;
  enrollmentDate: string; // From UserEnrolledCourse.cs (for sorting)
  completionStatus?: string; // e.g., "In Progress", "Completed"
  
  // Assumed necessary fields for student display/filtering/sorting:
  categoryID: number; // For filtering (from CourseDto.cs)
  progress: number; // A number between 0 and 100 (Assumed field for UI)
  instructor: string; // Instructor Name (Assumed field for UI/Search)
  rating: number; // For sorting by "Highest Rated" (from CourseDto.cs)
}

// Based on CourseCategoryDto.cs
// export interface Category {
//   categoryID: number; //
//   name: string; //
//   description?: string;
// }