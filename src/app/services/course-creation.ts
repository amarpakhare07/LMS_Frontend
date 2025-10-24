import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// IMPORT ENVIRONMENT HERE
import { environment } from '../../environment';

// --- Interface Definitions (Based directly on C# DTOs) ---

export interface CategoryDto {
  categoryID: number; // Matches CategoryID
  name: string;
  description?: string;
}

export interface CreateCategoryPayload {
  name: string; // Matches CreateCourseCategoryDto
  description?: string;
}

export interface CourseDto {
    courseID: number;
    title: string;
    description?: string;
    syllabus?: string;
    level?: string; // Maps to Level in CourseDto
    language?: string;
    duration?: number; // Maps to Duration in CourseDto
    thumbnailURL?: string;
    categoryID: number;
    published: boolean;
    rating?: number;
    reviewCount?: number;
    lessons: LessonDto[];
}

export interface CreateCoursePayload {
    title: string;
    description?: string;
    syllabus?: string;
    level?: string;
    language?: string;
    duration?: number;
    thumbnailURL?: string;
    categoryID: number;
    published: boolean;
}

export interface LessonDto {
    lessonID: number;
    courseID: number;
    title: string;
    content?: string; // This holds the document path/filename if applicable
    videoURL?: string;
    orderIndex?: number;
    lessonType?: string;
    estimatedTime?: number;
    createdAt: string; // DateTime
    updatedAt?: string; // DateTime
}

export interface CreateLessonPayload {
    courseID: number;
    title: string;
    content?: string; // IMPORTANT: Used to pass the document path/filename
    videoURL?: string;
    orderIndex?: number;
    lessonType?: string;
    estimatedTime?: number;
}

// Frontend Model for Lesson (mixes DTO fields with UI fields)
export interface FrontendLessonModel {
  id: string; // Frontend unique ID
  lessonID?: number; // Backend ID
  courseID: number;
  title: string;
  lessonType: 'Video' | 'Article' | 'Quiz' | string;
  estimatedTime: number; 
  videoURL?: string;
  includeDocument: boolean;
  attachmentFile?: File | { name: string; size: number }; 
  orderIndex: number; 
  content?: string; // The file path/name after upload
}


// --- API Configuration ---
// NOW READING FROM ENVIRONMENT:
const API_BASE_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CourseCreationService {

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    // NOTE: In a real app, JWT token would be added for authorization checks
    return new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}` 
    });
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    // Use the specific backend message if available
    const message = error.error?.Message || error.error?.errors?.[0]?.errorMessage || 'An unknown error occurred on the server.';
    return throwError(() => new Error(message));
  }

  // --- Step 1: Category Operations (CourseCategoriesController) ---

  getAllCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${API_BASE_URL}/CourseCategories`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createCategory(payload: CreateCategoryPayload): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(`${API_BASE_URL}/CourseCategories`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // --- Step 2: Course Operations (CourseController) ---

  createCourse(courseDto: CreateCoursePayload): Observable<CourseDto> {
    // The CourseController returns the created course object
    return this.http.post<CourseDto>(`${API_BASE_URL}/Course`, courseDto, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // --- Step 3: Lesson & Document Operations (LessonController & CourseController) ---

  /**
   * Uploads a lesson document (attachment) to the course material endpoint.
   * @param courseId The ID of the parent course.
   * @param file The file to upload.
   * @returns Observable with the server response, including the FileName (path/name).
   */
  uploadLessonDocument(courseId: number, file: File): Observable<{ FileName: string, Message: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    // IMPORTANT: No 'Content-Type' header for FormData uploads
    const fileHeaders = new HttpHeaders(); 
    
    // Maps to [HttpPost("{courseId}/document")] in CourseController
    return this.http.post<{ FileName: string, Message: string }>(
      `${API_BASE_URL}/Course/${courseId}/document`, 
      formData, 
      { headers: fileHeaders }
    ).pipe(catchError(this.handleError));
  }

  createLesson(lessonDto: CreateLessonPayload): Observable<LessonDto> {
    // Maps to [HttpPost] in LessonController. Returns the created LessonDto.
    return this.http.post<LessonDto>(`${API_BASE_URL}/Lesson`, lessonDto, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
  
  // NOTE: You don't have a dedicated Finalize endpoint, so we'll use PUT /Course/{id} 
  // with the full CourseDto to update the status/details when publishing.
  finalizeCourse(courseId: number, courseData: CourseDto): Observable<any> {
    // Maps to [HttpPut("{id}")] in CourseController
    return this.http.put(`${API_BASE_URL}/Course/${courseId}`, courseData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
}
