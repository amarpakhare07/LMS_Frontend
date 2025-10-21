import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CourseService } from '../../services/course-servics';
import { CategoryService } from '../../services/category-service';
import {Category } from '../../models/interfaces';
import {Course} from '../../models/course.model';
import { CourseCardComponent } from '../course-card/course-card';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CourseCardComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  searchQuery = '';
  filteredCourses: Course[] = [];
  loading = false;
  error = '';

  categories: Category[] = [];
  showAllCategories = false;

  @ViewChildren('catScroll') catScroll!: QueryList<ElementRef<HTMLDivElement>>;
  arrowState: { left: boolean; right: boolean }[] = [];

  constructor(
    private courseService: CourseService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategoriesAndCourses();
  }

  private loadCategoriesAndCourses(): void {
    this.loading = true;
    this.error = '';

    // fetch both categories and courses in parallel
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.courseService.getAllCourses().subscribe({
          next: (courses) => {
            // assign courses to categories
            this.categories = categories
              .map(cat => ({
                ...cat,
                courses: courses.filter(c => c.categoryID === cat.categoryID)
              }))
              .filter(cat => cat.courses && cat.courses.length); // only keep categories with courses

            // init scroll arrow state
            this.arrowState = this.categories.map(() => ({ left: true, right: false }));
            this.loading = false;
            setTimeout(() => this.updateAllArrowStates(), 200);
          },
          error: (err) => {
            console.error(err);
            this.error = 'Failed to load courses.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load categories.';
        this.loading = false;
      }
    });
  }

  // ---- search feature remains unchanged ----
  onSearch() {
    const q = this.searchQuery.trim();
    if (!q) {
      this.filteredCourses = [];
      return;
    }

    this.loading = true;
    this.error = '';
    this.courseService.getAllCourses().subscribe({
      next: (list) => {
        this.filteredCourses = list.filter(c =>
          [c.title, c.description, c.syllabus, c.level, c.language]
            .filter(Boolean)
            .some(f => f!.toLowerCase().includes(q.toLowerCase()))
        );
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load courses.';
        this.loading = false;
      }
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredCourses = [];
  }

  toggleShowAllCategories() {
    this.showAllCategories = !this.showAllCategories;
    setTimeout(() => this.updateAllArrowStates(), 200);
  }

  scrollCategory(index: number, dir: 'left' | 'right') {
    const el = this.catScroll.toArray()[index]?.nativeElement;
    if (!el) return;
    const amt = Math.floor(el.clientWidth * 0.7);
    el.scrollBy({ left: dir === 'right' ? amt : -amt, behavior: 'smooth' });
    setTimeout(() => this.updateArrowStateFor(index), 350);
  }

  onCategoryScroll(index: number) {
    setTimeout(() => this.updateArrowStateFor(index), 100);
  }

  private updateAllArrowStates() {
    this.categories.forEach((_, i) => this.updateArrowStateFor(i));
  }

  private updateArrowStateFor(index: number) {
    const el = this.catScroll.toArray()[index]?.nativeElement;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft <= 5;
    const right = el.scrollLeft >= (max - 5);
    if (!this.arrowState[index]) this.arrowState[index] = { left: true, right: false };
    this.arrowState[index].left = left;
    this.arrowState[index].right = right;
  }

  get visibleCategories() {
    return this.showAllCategories ? this.categories : this.categories.slice(0, 3);
  }
}