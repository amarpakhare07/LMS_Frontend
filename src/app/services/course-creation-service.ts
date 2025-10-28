import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';
import { Observable, tap, of, throwError, map } from 'rxjs';
import { 
    Lesson, 
    Course, 
    CourseCategory,
    CreateCourseDto
} from '../models/course.model';
import { AuthService } from './auth-service';

// --- INTERFACES (MODELS) ---

// export interface CourseCategory {
//   categoryID: number; // optional for creation
//   name: string;
//   description: string;
// }

// export interface CourseDetail {
//   // id is optional for creation/update body, mandatory for URL
//   id?: number; 
//   categoryID: number;
//   title: string;
//   description: string;
// }

// export interface Course extends CourseDetail {
//   id: number;
//   instructorId: number;
//   status: 'Draft' | 'Published';
  
//   // Note: Assuming lessons are managed separately and not returned with Course GET
// }

// export interface Lesson {
//   lessonID: number; // ID is required for update
//   courseID: number; // 👈 CRITICAL FIX: Match DTO
//   title: string; // 👈 CRITICAL FIX: Match DTO
//   content?: string;
//   videoURL?: string;
//   orderIndex: number; // 👈 CRITICAL FIX: Match DTO
//   lessonType?: string;
//   estimatedTime: number | null; // 👈 CRITICAL FIX: Match DTO (replaces 'duration')
// }

// --- COURSE INSTRUCTOR SERVICE ---

@Injectable({ providedIn: 'root' })

export class CourseInstructorService {
  private http = inject(HttpClient);
  // Base URL is /api/
  private apiUrl = environment.apiUrl; 
  private authService = inject(AuthService);


  getCurrentInstructorId(): Observable<number> {
    const userId = this.authService.getCurrentUserId();

    if (userId !== null) {
      // Return the actual user ID inside an Observable
      console.log("this is you id ",userId)
      return of(userId);
    } else {
      // If no user ID is available (not logged in), return an error or default 0
      console.error("CRITICAL: User ID is null. Cannot proceed with course creation.");
      // You can return of(0) for safety, or throw an error via an observable
      return throwError(() => new Error('Instructor not authenticated.'));
    } 
  }

  // --- COURSE CATEGORY APIs ---
  
  /**
   * Retrieves all available course categories.
   */
  getAllCategories(): Observable<CourseCategory[]> {
    const endpoint = `${this.apiUrl}/CourseCategories`;
    console.log('➡️ API CHECK: Sending GET request to fetch all course categories.');

    return this.http.get<CourseCategory[]>(endpoint).pipe(
      tap((categories) => {
        console.log(`✅ API CHECK: Successfully received ${categories.length} categories.`);
      })
    );
  }

  /**
   * Creates a new course category.
   * API: POST /api/CourseCategories
   * @param categoryDetails An object containing the new category's name and description.
   * @returns An Observable of the created CourseCategory, including its new ID.
   */
  createCategory(categoryDetails: Omit<CourseCategory, 'id'>): Observable<CourseCategory> {
    const endpoint = `${this.apiUrl}/CourseCategories`;
    console.log('➡️ API CHECK: Sending POST request to create new category:', categoryDetails.name);

    return this.http.post<CourseCategory>(endpoint, categoryDetails).pipe(
      tap((newCategory) => {
        console.log(`✅ API CHECK: Category created successfully. Received ID: ${newCategory.categoryID}`);
      })
    );
  }

  /**
   * @NEW_API_IMPLEMENTATION
   * Updates an existing course category's details (name/description).
   * API: PUT /api/CourseCategories/{id}
   * @param category The full category object with its ID and updated details.
   * @returns An Observable of the updated CourseCategory.
   */
    updateCategoryDetails(categoryDetails: CourseCategory): Observable<CourseCategory> {
      // Ensuring category has an ID for the PUT request
      if (!categoryDetails.categoryID) {
          return throwError(() => new Error('Category ID is required for update.'));
      }
      const endpoint = `${this.apiUrl}/CourseCategories/${categoryDetails.categoryID}`;
      console.log(`➡️ API CHECK: Sending PUT request to update category ID: ${categoryDetails.categoryID}`);

      // The return type of the method (Observable<CourseCategory>) now matches 
      // the generic type of the HTTP call (http.put<CourseCategory>).
      return this.http.put<CourseCategory>(endpoint, categoryDetails).pipe(
          tap((updatedCategory) => {
              console.log(`✅ API CHECK: Category ${updatedCategory.categoryID} updated successfully.`);
          })
      );
    }

  // --- COURSE APIs ---

  /**
   * Creates a new course.
   * API: POST /api/Course
   */
  createCourse(courseDetails: CreateCourseDto): Observable<Course> {
    const endpoint = `${this.apiUrl}/Course`;
    console.log('➡️ API CHECK: Sending POST request to create new course:', courseDetails.title);

    return this.http.post<Course>(endpoint, courseDetails).pipe(
      tap((newCourse) => {
        console.log(`✅ API CHECK: Course created successfully. Received ID: ${newCourse.courseID}`);
      })
    );
  }

  /**
   * Updates an existing course's details.
   * API: PUT /api/Course/{id}
   */
  updateCourseDetails(courseId: number, updates: Partial<Course>): Observable<Course> {
    const endpoint = `${this.apiUrl}/Course/${courseId}`;
    console.log(`➡️ API CHECK: Sending PUT request to update course ${courseId} with updates:`, updates);

    return this.http.put<Course>(endpoint, updates).pipe(
      tap((updatedCourse) => {
        console.log(`✅ API CHECK: Course ${courseId} details updated.`);
      })
    );
  }
  
  /**
   * Updates a course's publication status.
   * API: PUT /api/Course/status/{courseId}
   */
  updateCourseStatus(courseId: number, status: 'Draft' | 'Published'): Observable<void> {
    const endpoint = `${this.apiUrl}/Course/status/${courseId}`;
    console.log(`➡️ API CHECK: Sending PUT request to set course ${courseId} status to: ${status}`);

    return this.http.put<void>(endpoint, { status }).pipe(
      tap(() => {
        console.log(`✅ API CHECK: Course ${courseId} status successfully set to ${status}.`);
      })
    );
  }

  // --- LESSON APIs ---

  /**
   * Retrieves all lessons for a specific course.
   * API: GET /api/Lesson/{courseId}
   */
  getLessonsByCourse(courseId: number): Observable<Lesson[]> {
    const endpoint = `${this.apiUrl}/Lesson/${courseId}`;
    console.log(`➡️ API CHECK: Sending GET request to fetch lessons for course ID: ${courseId}`);

    return this.http.get<Lesson[]>(endpoint).pipe(
      tap((lessons) => {
        console.log(`✅ API CHECK: Received ${lessons.length} lessons for course ${courseId}.`);
      })
    );
  }
  
  /**
   * Creates a new lesson.
   * API: POST /api/Lesson
   */
  createLesson(lesson: Omit<Lesson, 'lessonID'>): Observable<Lesson> {
    const endpoint = `${this.apiUrl}/Lesson`;
    console.log('➡️ API CHECK: Sending POST request to create new lesson:', lesson.title);

    return this.http.post<Lesson>(endpoint, lesson).pipe(
      tap((newLesson) => {
        console.log(`✅ API CHECK: Lesson created successfully! Received ID: ${newLesson.lessonID}`);
      })
    );
  }

  uploadFile(lessonId: number, file: File): Observable<{url: string, fileName: string}> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const apiUrl = `/api/Lesson/${lessonId}/document`;
    return this.http.post<any>(apiUrl, formData).pipe(
        map((response: any) => {
            // Ensure you return the URL and FileName if the component needs it
            return {
                url: response.url || response.Url, // Use 'Url' for C# convention
                fileName: response.fileName || response.FileName 
            };
        })
    );
}
uploadLessonAttachment(lessonId: number, file: File): Observable<{ url: string, fileName: string }> {
        const formData = new FormData();
        // The backend action expects the file to be named 'file' in the form data
        formData.append('file', file, file.name);

        // The correct backend URL for your API controller
        const apiUrlLesson = `/Lesson/${lessonId}/document`;

        // The backend returns an object { Url: string, FileName: string, Message: string }
        return this.http.post<any>(this.apiUrl+apiUrlLesson, formData).pipe(
            map((response: any) => ({
                url: response.Url || response.url, // Handle C# PascalCase 'Url' or TypeScript camelCase 'url'
                fileName: response.FileName || response.fileName 
            }))
        );
    }
  
  /**
   * Updates an existing lesson.
   * API: PUT /api/Lesson/{id}
   */
  updateLesson(lesson: Lesson): Observable<Lesson> {
    const endpoint = `${this.apiUrl}/Lesson/${lesson.lessonID}`;
    console.log(`➡️ API CHECK: Sending PUT request to update lesson ID: ${lesson.lessonID}`);

    return this.http.put<Lesson>(endpoint, lesson).pipe(
      tap((updatedLesson) => {
        console.log(`✅ API CHECK: Lesson ${updatedLesson.lessonID} updated successfully.`);
      })
    );
  }

  /**
   * Deletes a lesson.
   * API: DELETE /api/Lesson/{id}
   */
  deleteLesson(lessonId: number): Observable<void> {
    const endpoint = `${this.apiUrl}/Lesson/${lessonId}`;
    console.log(`➡️ API CHECK: Sending DELETE request for lesson ID: ${lessonId}`);

    return this.http.delete<void>(endpoint).pipe(
      tap(() => {
        console.log(`✅ API CHECK: Lesson ${lessonId} deleted successfully.`);
      })
    );
  }



uploadCourseMaterial(courseId: number, file: File): Observable<{ Url: string, FileName: string, Message: string }> {
    const endpoint = `${this.apiUrl}/Course/${courseId}/document`;
    console.log(`➡️ API CHECK: Sending POST request to upload course material for ID: ${courseId}`);

    const formData = new FormData();
    // 'file' must match the IFormFile parameter name in your C# controller
    formData.append('file', file); 

    // The API returns the URL and FileName upon success
    return this.http.post<{ Url: string, FileName: string, Message: string }>(endpoint, formData).pipe(
        tap((response) => {
            console.log('✅ API CHECK: Course material uploaded successfully.', response);
        })
    );
}

    /**
     * Updates the CourseMaterial URL field in the CourseInstructors table.
     * API: PUT /api/Course/material/{courseId} (Assumed new, dedicated endpoint)
     * @param courseId The ID of the course.
     * @param materialUrl The permanent URL of the uploaded material.
     * @returns An Observable indicating success.
     */
    updateCourseMaterial(courseId: number, materialUrl: string | null): Observable<void> {
        if (!courseId) {
            return throwError(() => new Error('Course ID is required to update course material.'));
        }
        const endpoint = `${this.apiUrl}/Course/material/${courseId}`;
        console.log(`➡️ API CHECK: Sending PUT request to update course ${courseId} material.`);
        
        // Assuming the API expects a simple JSON body like { courseMaterial: url }
        return this.http.put<void>(endpoint, { courseMaterial: materialUrl }).pipe(
            tap(() => {
                console.log(`✅ API CHECK: Course ${courseId} material updated to: ${materialUrl}`);
            })
        );
    }
}
