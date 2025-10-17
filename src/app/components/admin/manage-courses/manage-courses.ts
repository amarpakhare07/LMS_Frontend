import { Component, inject } from '@angular/core';
import { AdminService } from '../../../services/admin-service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Course } from '../../../models/course.model';
import { Category } from '../../../models/interfaces';

@Component({
  selector: 'app-manage-courses',
  imports: [CommonModule,FormsModule],
  templateUrl: './manage-courses.html',
  styleUrl: './manage-courses.css'
})
export class ManageCourses {
  adminService = inject(AdminService);

  isLoading = true;
  allCourses: Course[] = [];
  filteredCourses: Course[] = [];
  allCategories: Category[] = [];

  // Filter properties
  searchTerm: string = '';
  categoryFilter: string = 'all'; // Default to 'all'
  statusFilter: string = 'all'; // 'all', 'published', 'draft'

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      courses: this.adminService.getCourses(),
      categories: this.adminService.getCategories()
    }).subscribe({
      next: ({ courses, categories }) => {
        this.allCourses = courses;
        this.allCategories = categories;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load course data', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let courses = [...this.allCourses];

    if (this.statusFilter !== 'all') {
      const isPublished = this.statusFilter === 'published';
      courses = courses.filter(course => course.published === isPublished);
    }

    if (this.categoryFilter !== 'all') {
      courses = courses.filter(course => course.categoryID === +this.categoryFilter);
    }

    if (this.searchTerm) {
      const lowercasedTerm = this.searchTerm.toLowerCase();
      courses = courses.filter(course =>
        course.title.toLowerCase().includes(lowercasedTerm) ||
        course.description.toLowerCase().includes(lowercasedTerm)
      );
    }
    
    this.filteredCourses = courses;
  }

  // Helper to get category name from its ID
  getCategoryName(categoryId: number): string {
    const category = this.allCategories.find(c => c.categoryID === categoryId);
    return category ? category.name : 'Uncategorized';
  }

  togglePublishStatus(course: Course): void {
    const action = course.published ? 'Unpublish' : 'Publish';
    const confirmation = confirm(`Are you sure you want to ${action} the course "${course.title}"?`);

    if (confirmation) {
      const newStatus = !course.published;
      this.adminService.updateCourseStatus(course.courseID, newStatus).subscribe({
        next: () => {
          const courseInAll = this.allCourses.find(c => c.courseID === course.courseID);
          if (courseInAll) courseInAll.published = newStatus;
          this.applyFilters();
        },
        error: (err) => console.error('Failed to update course status', err)
      });
    }
  }
}
