// src/app/components/home/home.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

// --- Services and Models ---
import { CourseService } from '../../services/course-service';
import { AdminService } from '../../services/admin-service'; // <-- Import AdminService
import { Course } from '../../models/course.model';
import { Category } from '../../models/interfaces'; // <-- Import Category

// --- Components ---
// import { CourseCardComponent } from '../course-card/course-card';

// --- NEW MATERIAL IMPORTS ---
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CourseCardComponent } from '../course-card/course-card';

// This new interface helps us group the courses
export interface CourseCategoryGroup {
  category: Category;
  courses: Course[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CourseCardComponent, // Keep your existing course card
    // --- ADDED MODULES ---
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  private courseService = inject(CourseService);
  private adminService = inject(AdminService); // <-- Inject AdminService

  searchQuery: string = '';
  
  // --- Data Properties ---
  allCourses: Course[] = [];
  allCategories: Category[] = [];
  groupedCourses: CourseCategoryGroup[] = []; // For the new carousels
  filteredCourses: Course[] = []; // For the search results
  
  isLoading = true; // For initial page load
  isSearching = false; // For search-specific loading
  error = '';

  ngOnInit(): void {
    // Load all data on init
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.error = '';
    forkJoin({
      courses: this.courseService.getAllCourses(),
      categories: this.adminService.getCategories() // <-- Fetch categories
    }).subscribe({
      next: ({ courses, categories }) => {
        this.allCourses = courses.filter(c => c.published); // Only show published courses
        this.allCategories = categories;
        
        // --- Group courses by category ---
        this.groupedCourses = this.groupCourses(this.allCourses, this.allCategories);
        // ---
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load home page data', err);
        this.error = 'Failed to load courses. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  private groupCourses(courses: Course[], categories: Category[]): CourseCategoryGroup[] {
    return categories.map(category => {
      // Find all courses that match this category's ID
      const coursesInCategory = courses.filter(course => course.categoryID === category.categoryID);
      
      return {
        category: category,
        courses: coursesInCategory
      };
    })
    // Optional: filter out categories that have no published courses
    .filter(group => group.courses.length > 0);
  }

  // Called when user presses enter or clicks search
  onSearch() {
    this.isSearching = true; // Use a separate searching flag
    this.error = '';
    
    const q = this.searchQuery?.trim();
    if (!q) {
      this.filteredCourses = [];
      this.isSearching = false;
      return;
    }
    
    // The search logic is now just a local filter
    this.applyFilter(q);
    this.isSearching = false;
  }

  private applyFilter(q: string) {
    const query = q.toLowerCase();
    this.filteredCourses = this.allCourses.filter(c =>
      [c.title, c.description, c.syllabus, c.level, c.language]
        .filter(Boolean)
        .some(field => field!.toLowerCase().includes(query))
    );
  }

  // Clears the search query AND the results
  clearSearch() {
    this.searchQuery = '';
    this.filteredCourses = [];
    this.error = '';
  }
}