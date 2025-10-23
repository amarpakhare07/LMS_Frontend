import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http'; // 🚨 NEW: Needed for the service
import { CourseService } from '../../../services/instructor-course-service'; // 🚨 NEW: Import the new service

// Define the structure for a course object (kept here for component's use)
export interface Course {
  name: string;
  instructor: string;
  lessons: number;
  totalTime: string;
  status: 'Published' | 'Upcoming' | 'Push';
}

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule,
    HttpClientModule // 🚨 ADDED: Required to use HttpClient in the service
  ],
  templateUrl: './instructor-courses.html',
  styleUrls: ['./instructor-courses.css']
})
export class InstructorCoursesComponent implements OnInit {

  // 🚨 CHANGE: Initialize to empty array instead of hardcoded data
  courseList: Course[] = []; 
  isLoading: boolean = true; // 🚨 NEW: Loading flag for UI feedback

  // 🚨 CHANGE: Inject the CourseService 🚨
  constructor(private courseService: CourseService) { }

  ngOnInit(): void {
    this.fetchCourses();
  }
  
  /** * 🚨 NEW: Method to fetch data from the service
   */
  fetchCourses(): void {
    this.isLoading = true;
    this.courseService.getInstructorCourses().subscribe({
      next: (data) => {
        this.courseList = data;
        this.isLoading = false;
        console.log('Courses fetched successfully:', this.courseList);
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
        // Fallback or error handling can go here
        this.isLoading = false;
      }
    });
  }

  // Helper method to get the correct CSS class for the status pill (remains the same)
  getStatusClass(status: Course['status']): string {
    switch (status) {
      case 'Published':
        return 'status-published';
      case 'Upcoming':
        return 'status-upcoming';
      case 'Push':
      default:
        return 'status-push';
    }
  }
  
  trackByCourseName(index: number, course: Course): string {
    return course.name; 
  }
  
  // Placeholder action methods (remains the same)
  viewCourse(course: Course): void { /* ... */ }
  editCourse(course: Course): void { /* ... */ }
  deleteCourse(course: Course): void { /* ... */ }
}