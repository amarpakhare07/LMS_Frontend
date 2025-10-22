// src/app/features/course-learn/course-learn.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { MatCardModule } from '@angular/material/card'; // ✅ add this

import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CourseService } from '../../../services/course-service';
import { Course, Lesson } from '../../../models/course.model';
import { switchMap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-course-learn',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './course-learn.html',
  styleUrls: ['./course-learn.css']
})
export class CourseLearn {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private sanitizer = inject(DomSanitizer);

  course = signal<Course | null>(null);
  currentLesson = signal<Lesson | null>(null);
  errorMsg = signal<string | null>(null);

  // UI
  sidebarOpen = false;

  constructor() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (!id) return of(null);
        return this.courseService.getCourse(id);
      }),
      catchError(err => {
        console.error(err);
        this.errorMsg.set('Failed to load course.');
        return of(null);
      })
    ).subscribe(c => {
      this.course.set(c);
      const lessonIdParam = Number(this.route.snapshot.queryParamMap.get('lessonId'));
      const first = c?.lessons?.[0] ?? null;
      const target = c?.lessons?.find(l => l.lessonID === lessonIdParam) ?? first;
      this.currentLesson.set(target);
    });
  }

  selectLesson(l: Lesson) {
    this.currentLesson.set(l);
    // Close sidebar on mobile after selecting
    this.sidebarOpen = false;
  }

  trackByLessonId(_i: number, l: Lesson) {
    return l.lessonID;
  }

  isYouTube(url: string | null | undefined): boolean {
    return !!url && /(?:youtube\.com|youtu\.be)/i.test(url);
  }

  youtubeEmbedUrl(url: string): string {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    const id = match?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  safeYoutubeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.youtubeEmbedUrl(url));
  }

  // Navigation helpers
  private lessonIndex(): number {
    const c = this.course();
    const cur = this.currentLesson();
    if (!c?.lessons || !cur) return -1;
    return c.lessons.findIndex(x => x.lessonID === cur.lessonID);
  }

  hasPrev(): boolean {
    const idx = this.lessonIndex();
    return idx > 0;
  }

  hasNext(): boolean {
    const c = this.course();
    const idx = this.lessonIndex();
    return !!c?.lessons && idx > -1 && idx < c.lessons.length - 1;
  }

  prevLesson() {
    const c = this.course();
    const idx = this.lessonIndex();
    if (!c?.lessons || idx <= 0) return;
    this.currentLesson.set(c.lessons[idx - 1]);
  }

  nextLesson() {
    const c = this.course();
    const idx = this.lessonIndex();
    if (!c?.lessons || idx === -1 || idx >= c.lessons.length - 1) return;
    this.currentLesson.set(c.lessons[idx + 1]);
  }
}
