// src/app/components/student/my-courses/student-my-courses.ts
import { Component, inject, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Assuming a simplified Course model for the student view

// *** NEW SERVICE: StudentCourseService ***
import { StudentCourseService } from '../../../../services/student-course-service'; // Assumed service name
import { EnrolledCourse } from '../../../../models/student.model'; // Assuming EnrolledCourse is defined here
import { Category } from '../../../../models/interfaces'; // Assuming Category model is defined here

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
import { MatTooltipModule } from '@angular/material/tooltip'; // Added for rating tooltip

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
    MatTooltipModule, // Added
  ],
  templateUrl: './student-my-courses.html',
  styleUrls: ['./student-my-courses.css'],
})
export class MyCoursesComponent implements OnInit {
  private studentCourseService = inject(StudentCourseService); // Renamed service injection

  isLoading = true;
  allCourses: EnrolledCourse[] = [];
  filteredCourses: EnrolledCourse[] = [];
  allCategories: Category[] = [];

  // Filters are now student-focused
  categoryFilter: string ='all';
  //sortFilter: 'recentlyAccessed' | 'highestProgress' | 'highestRating' = 'recentlyAccessed';
  searchTerm = '';

  // sortOptions = [
  //   { value: 'recentlyAccessed', viewValue: 'Recently Accessed' },
  //   { value: 'highestProgress', viewValue: 'Highest Progress' },
  //   { value: 'highestRating', viewValue: 'Highest Rating' },
  // ];

  ngOnInit(): void {
    // Fetch both courses (enrolled only) and categories in parallel
    this.isLoading = true;
    forkJoin({
      courses: this.studentCourseService.getEnrolledCourses(), 
      categories: this.studentCourseService.getCategories(), // Re-use the category service call
    }).subscribe({
      next: ({ courses, categories }) => {
        // Assume the API returns necessary data (progress, rating) for enrolled courses
        this.allCourses = courses; 
        this.allCategories = categories;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch courses or categories:', err);
        this.isLoading = false;
        // Handle error state gracefully
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

    // 2. Filter by Search Term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      courses = courses.filter(
        (c) => c.title.toLowerCase().includes(term) || 
               c.instructor.toLowerCase().includes(term) // Search by instructor too
      );
    }

    // 3. Sort
    // courses.sort((a, b) => {
    //   switch (this.sortFilter) {
    //     case 'highestProgress':
    //       return (b.progress || 0) - (a.progress || 0);
    //     case 'highestRating':
    //       return (b.rating || 0) - (a.rating || 0);
    //     case 'recentlyAccessed':
    //     default:
    //       // In a real app, this would use an 'lastAccessedDate' property, but here we use the existing array order
    //       // For now, we return 0 (no change), as the fetched order is often considered "recent" by default
    //       return 0; 
    //   }
    // });

    this.filteredCourses = courses;
  }

  getCategoryName(categoryId: number): string {
    return this.allCategories.find((c) => c.categoryID === categoryId)?.name || 'Uncategorized';
  }
}