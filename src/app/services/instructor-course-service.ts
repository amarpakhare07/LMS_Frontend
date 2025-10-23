import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Course } from '../components/instructor/instructor-courses/instructor-courses'; // Import the Course interface

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  // 🚨 Replace this with your actual API URL endpoint for fetching courses
  // e.g., private apiUrl = '/api/UserManagement/me/courses';
  private mockApiUrl = '/api/instructor/courses'; 

  // Hardcoded data matching your screenshot for initial setup
  private mockCourses: Course[] = [
    { name: 'Machine Learning', instructor: 'John Debi', lessons: 32, totalTime: '248 Hr', status: 'Published' },
    { name: 'Techniques for Reduction', instructor: 'John Debi', lessons: 24, totalTime: '248 Hr', status: 'Published' },
    { name: 'User Interface Design', instructor: 'John Debi', lessons: 25, totalTime: '248 Hr', status: 'Push' },
    { name: 'Digital Marketing', instructor: 'John Debi', lessons: 30, totalTime: '248 Hr', status: 'Published' },
    { name: 'Python Programming', instructor: 'John Debi', lessons: 25, totalTime: '248 Hr', status: 'Upcoming' },
  ];

  constructor(private http: HttpClient) { }

  /**
   * Fetches the list of courses for the current instructor.
   * Currently mocks the HTTP call by returning hardcoded data.
   */
  getInstructorCourses(): Observable<Course[]> {
    // 🚨 To simulate a real API call:
    // return this.http.get<Course[]>(this.mockApiUrl);
    
    // Using mock data for immediate testing:
    console.log('--- CourseService: Simulating API call for courses ---');
    return of(this.mockCourses).pipe(
      delay(500) // Simulate network latency
    );
  }
}