import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http'; 
import { CourseService } from '../../../services/instructor-course-service'; 

// Define the structure for a course object (component's expected data format)
export interface Course {
  name: string;
  instructor: string;
  lessons: number;
  totalTime: string;
  status: 'Published' | 'Upcoming' | 'Push';
  category: string;
}

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule,
    HttpClientModule 
  ],
  templateUrl: './instructor-courses.html',
  styleUrls: ['./instructor-courses.css']
})
export class InstructorCoursesComponent implements OnInit {

  courseList: Course[] = []; 
  isLoading: boolean = true; 

  constructor(private courseService: CourseService) { }

  ngOnInit(): void {
    this.fetchCourses();
  }
  
  fetchCourses(): void {
    this.isLoading = true;
    // The service now returns real data from the API
    this.courseService.getInstructorCourses().subscribe({
      next: (data) => {
        this.courseList = data;
        this.isLoading = false;
        console.log('Courses fetched successfully from API.');
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
        this.isLoading = false;
      }
    });
  }

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
  
  viewCourse(course: Course): void { /* ... */ }
  editCourse(course: Course): void { /* ... */ }
  deleteCourse(course: Course): void { /* ... */ }
}