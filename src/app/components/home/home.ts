import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CourseService } from '../../services/course-servics';
import { Course } from '../../models/course.model';
import { CourseCardComponent } from '../course-card/course-card';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CourseCardComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  searchQuery: string = '';
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  loading = false;
  error = '';

  constructor(private courseService: CourseService) {}

  // Called when user presses enter or clicks search
  onSearch() {
    const q = this.searchQuery?.trim();
    if (!q) {
      // if empty search, clear results (or show all courses if you prefer)
      this.filteredCourses = [];
      return;
    }

    // If we already loaded all courses, just filter locally
    if (this.courses && this.courses.length) {
      this.applyFilter(q);
      return;
    }

    // otherwise fetch from backend
    this.loading = true;
    this.error = '';
    this.courseService.getAllCourses()
      .pipe(
        tap(() => (this.loading = true))
      )
      .subscribe({
        next: (list) => {
          this.courses = list || [];
          this.applyFilter(q);
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load courses.';
          this.loading = false;
        }
      });
  }

  private applyFilter(q: string) {
    const query = q.toLowerCase();
    this.filteredCourses = this.courses.filter(c =>
      [c.title, c.description, c.syllabus, c.level, c.language]
        .filter(Boolean)
        .some(field => field!.toLowerCase().includes(query))
    );
  }

  // optional helper to allow quick clearing
  clearSearch() {
    this.searchQuery = '';
    this.filteredCourses = [];
  }
}