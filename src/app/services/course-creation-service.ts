import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';
import { Observable, tap, of, throwError } from 'rxjs';

// --- INTERFACES (MODELS) ---

export interface CourseCategory {
  categoryID: number; // optional for creation
  name: string;
  description: string;
}

export interface CourseDetail {
  // id is optional for creation/update body, mandatory for URL
  id?: number; 
  categoryID: number;
  title: string;
  description: string;
}

export interface Course extends CourseDetail {
  id: number;
  instructorId: number;
  status: 'Draft' | 'Published';
  
  // Note: Assuming lessons are managed separately and not returned with Course GET
}

export interface Lesson {
  id: number; // ID is required for update
  CourseID: number; // 👈 CRITICAL FIX: Match DTO
  Title: string; // 👈 CRITICAL FIX: Match DTO
  Content?: string;
  VideoURL?: string;
  OrderIndex: number; // 👈 CRITICAL FIX: Match DTO
  LessonType?: string;
  EstimatedTime: number | null; // 👈 CRITICAL FIX: Match DTO (replaces 'duration')
}

// --- COURSE INSTRUCTOR SERVICE ---

@Injectable({ providedIn: 'root' })

export class CourseInstructorService {
  private http = inject(HttpClient);
  // Base URL is /api/
  private apiUrl = environment.apiUrl; 

  getCurrentInstructorId(): Observable<number> {
    // IMPORTANT: Change the number '2' below to any valid Instructor ID 
    // you know exists in your backend database (e.g., 1, 3, 5).
    return of(2); 
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
  createCourse(courseDetails: CourseDetail): Observable<Course> {
    const endpoint = `${this.apiUrl}/Course`;
    console.log('➡️ API CHECK: Sending POST request to create new course:', courseDetails.title);

    return this.http.post<Course>(endpoint, courseDetails).pipe(
      tap((newCourse) => {
        console.log(`✅ API CHECK: Course created successfully. Received ID: ${newCourse.id}`);
      })
    );
  }

  /**
   * Updates an existing course's details.
   * API: PUT /api/Course/{id}
   */
  updateCourseDetails(courseId: number, updates: Partial<CourseDetail>): Observable<Course> {
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
  createLesson(lesson: Omit<Lesson, 'id'>): Observable<Lesson> {
    const endpoint = `${this.apiUrl}/Lesson`;
    console.log('➡️ API CHECK: Sending POST request to create new lesson:', lesson.Title);

    return this.http.post<Lesson>(endpoint, lesson).pipe(
      tap((newLesson) => {
        console.log(`✅ API CHECK: Lesson created successfully! Received ID: ${newLesson.id}`);
      })
    );
  }
  
  /**
   * Updates an existing lesson.
   * API: PUT /api/Lesson/{id}
   */
  updateLesson(lesson: Lesson): Observable<Lesson> {
    const endpoint = `${this.apiUrl}/Lesson/${lesson.id}`;
    console.log(`➡️ API CHECK: Sending PUT request to update lesson ID: ${lesson.id}`);

    return this.http.put<Lesson>(endpoint, lesson).pipe(
      tap((updatedLesson) => {
        console.log(`✅ API CHECK: Lesson ${updatedLesson.id} updated successfully.`);
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
}
