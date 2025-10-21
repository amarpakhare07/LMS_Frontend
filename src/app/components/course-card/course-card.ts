import { Component, Input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Course } from '../../models/course.model';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, NgClass, RouterModule],
  templateUrl: './course-card.html',
  styleUrls: ['./course-card.css']
})
export class CourseCardComponent {
  @Input() course!: Course;

  isHovered = false;
  starsArray = [1, 2, 3, 4, 5];

  constructor(private router: Router) {}

  getDuration(duration?: number): string {
  if (!duration) return '—';
  if (duration < 60) return `${duration} min`;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours}h ${minutes}m`;
}

  getRoundedRating(): number {
    return Math.round(this.course.rating ?? 0);
  }

  getFormattedRating(): string {
    return this.course.rating ? this.course.rating.toFixed(1) : '—';
  }

  viewCourse(): void {
    this.router.navigate(['/course', this.course.courseID]);
  }
}

// getDuration(duration?: number): string {
//   if (!duration) return '—';
//   if (duration < 60) return ${duration} min;
//   const hours = Math.floor(duration / 60);
//   const minutes = duration % 60;
//   return ${hours}h ${minutes}m;
// }