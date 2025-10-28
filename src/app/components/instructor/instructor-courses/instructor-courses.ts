import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http'; 
import { CourseService } from '../../../services/instructor-course-service'; 
import { Router} from '@angular/router';

// Define the structure for a course object (component's expected data format)
export interface Course {
  courseID: number;
  name: string;
  instructor: string;
  lessons: number;
  totalTime: string;
  status: 'Published' | 'Upcoming' | 'Unlisted';
  category: string;
}

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    HttpClientModule,
    
],
  templateUrl: './instructor-courses.html',
  styleUrls: ['./instructor-courses.css']
})
export class InstructorCoursesComponent implements OnInit {

  courseList: Course[] = []; 
  isLoading: boolean = true; 

  constructor(private courseService: CourseService, private router: Router) { }

  ngOnInit(): void {
    this.fetchCourses();
    console.log(this.courseList)
  }
  
  fetchCourses(): void {
    this.isLoading = true;
    // The service now returns real data from the API
    this.courseService.getInstructorCourses().subscribe({
      next: (data) => {
        this.courseList = data;
        console.log('Fetched Courses:', data);
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
      case 'Unlisted':
      default:
        return 'status-push';
    }
  }
  
  trackByCourseName(index: number, course: Course): string {
    return course.name; 
  }
  
  viewCourse(course: Course): void { 
    this.router.navigate(['/instructor/course', course.name]);
   }
  editCourse(course: Course): void { 
  }
  createQuiz(course: Course): void {
    this.router.navigate([`/instructor/quiz-builder/${course.courseID}`]);
  }
  createCourse(): void {
    this.router.navigate(['/instructor/createcourse']);
  }

}