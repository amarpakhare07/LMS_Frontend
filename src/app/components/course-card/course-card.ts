import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { Course } from '../../models/course.model';

// --- MATERIAL IMPORTS ---
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip'; // <-- ADD THIS

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule // <-- AND ADD IT HERE
  ],
  templateUrl: './course-card.html',
  styleUrls: ['./course-card.css']
})
export class CourseCardComponent {
  @Input() course!: Course;

  starsArray = [1, 2, 3, 4, 5];

  // No router or isHovered needed
  constructor() {} 

  getDuration(duration?: number): string {
    if (!duration) return '—';
    if (duration < 60) return `${duration} min`;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (minutes === 0) return `${hours}h`; 
    return `${hours}h ${minutes}m`;
  }

  getRoundedRating(): number {
    return Math.round(this.course.rating ?? 0);
  }

  getFormattedRating(): string {
    return this.course.rating ? this.course.rating.toFixed(1) : '—';
  }
}