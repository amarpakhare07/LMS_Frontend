

import { Component, inject, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { StudentCourseService } from '../../../../services/student-course-service'; 
import { EnrolledCourse } from '../../../../models/student.model'; 
import { Category } from '../../../../models/interfaces'; 

// --- MATERIAL IMPORTS ---
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip'; 

import { CourseCardComponent } from '../../../course-card/course-card';


@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    CourseCardComponent,
  ],
  templateUrl: './student-my-courses.html',
  styleUrls: ['./student-my-courses.css'],
})
export class MyCoursesComponent implements OnInit {
  private studentCourseService = inject(StudentCourseService); 

  isLoading = true;
  // Ensure EnrolledCourse includes progress and rating
  allCourses: EnrolledCourse[] = [];
  filteredCourses: EnrolledCourse[] = [];
  allCategories: Category[] = [];

  // Filters
  categoryFilter: string ='all';
  searchTerm = '';

  ngOnInit(): void {
    // Fetch both courses (enrolled only) and categories in parallel
    this.isLoading = true;
    forkJoin({
      courses: this.studentCourseService.getEnrolledCourses(), 
      categories: this.studentCourseService.getCategories(), 
    }).subscribe({
      next: ({ courses, categories }) => {
        // Ensure 'courses' contains objects matching the EnrolledCourse interface (including progress, rating, etc.)
        this.allCourses = courses; 
        this.allCategories = categories;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch courses or categories:', err);
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    let courses = [...this.allCourses];

    // 1. Filter by Category
    if (this.categoryFilter !== 'all') {
      const filterID = Number(this.categoryFilter);
      courses = courses.filter((c) => c.categoryID === filterID);
    }

    // 2. Filter by Search Term (Now using optional chaining for safer access to properties)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      courses = courses.filter(
        (c) => c.title?.toLowerCase().includes(term) || // Use ?. for title
               c.instructor?.toLowerCase().includes(term) // Use ?. for instructor
      );
    }

    this.filteredCourses = courses;
    // Log for debugging: Check how many courses are displayed after filtering
    console.log(`Search Term: '${this.searchTerm}', Courses displayed: ${this.filteredCourses.length}`);
  }

  // This helper is still needed for the category filter select options
  getCategoryName(categoryId: number): string {
    return this.allCategories.find((c) => c.categoryID === categoryId)?.name || 'Uncategorized';
  } 
}
