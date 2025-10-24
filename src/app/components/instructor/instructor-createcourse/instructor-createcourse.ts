import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// --- Hardcoded Interfaces matching your backend DTOs ---
interface CourseCategory {
  id: number;
  name: string;
}

interface CourseDetails {
  title: string;
  description: string;
  syllabus: string;
  level: string;
  language: string;
  duration: number; // In MINUTES (Point 3)
  thumbnailURL: string;
  categoryID: number;
  published: boolean;
}

interface Lesson {
  id?: number;
  courseID: number;
  title: string;
  content: string;
  videoURL: string;
  orderIndex: number;
  lessonType: 'Video' | 'Quiz' | 'Article';
  estimatedTime: number;
  includeDocument: boolean;
  attachmentFile?: File | null;
  // Simulated property for attachment link (since we can't upload to a real server)
  attachmentFileUrl: string;
}

// --- Component ---

@Component({
  selector: 'app-instructor-createcourse',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTabsModule, MatIconModule, MatButtonModule, MatInputModule,
    MatFormFieldModule, MatSelectModule, MatCheckboxModule,
    MatCardModule, MatListModule, MatTooltipModule,
    MatProgressSpinnerModule, MatDividerModule, MatSnackBarModule
  ],
  templateUrl: './instructor-createcourse.html',
  styleUrls: [`./instructor-createcourse.css`]
})
export class InstructorCreateCourseComponent implements OnInit {
  activeStep: 'category' | 'details' | 'lessons' = 'category';

  completedSteps: { [key: string]: boolean } = {
    category: false,
    details: false
  };

  categorySearchText: string = '';
  selectedCategory: CourseCategory | null = null;
  // NEW: Status to control the feedback message
  categoryStatus: 'new' | 'existing' | 'none' = 'none'; 

  courseData: CourseDetails = {
    title: '', description: '', syllabus: '',
    level: 'Beginner', language: 'English', duration: 60, 
    thumbnailURL: '', categoryID: 0, published: false
  };

  lessons: Lesson[] = [];

  lessonData: Lesson = this.getNewLessonTemplate(1);
  lessonToEditIndex: number | null = null;

  // --- Hardcoded Data ---
  hardcodedCategories: CourseCategory[] = [
    { id: 1, name: 'Web Development' },
    { id: 2, name: 'Data Science' },
    { id: 3, name: 'Digital Marketing' },
    { id: 4, name: 'Art & Design' }
  ];
  filteredCategories: CourseCategory[] = [];
  isLoading: unknown;
  expandedLessonId: number | null = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.filteredCategories = [...this.hardcodedCategories];
    this.selectedCategory = null;
    this.categorySearchText = '';
    this.categoryStatus = 'none';
  }

  getNewLessonTemplate(orderIndex: number): Lesson {
    return {
      courseID: 0,
      title: '', content: '', videoURL: '',
      orderIndex: orderIndex, lessonType: 'Video',
      estimatedTime: 15,
      includeDocument: false,
      attachmentFile: null,
      attachmentFileUrl: 'https://placehold.co/600x400/3f51b5/ffffff/pdf.pdf?text=Attached+Document' 
    };
  }

  getSelectedCategoryName(): string {
    return this.selectedCategory?.name || 'Category Not Set';
  }

  isFieldDisabled(step: 'category' | 'details' | 'lessons'): boolean {
    return this.completedSteps[step] && this.activeStep !== step;
  }

  setActiveStep(step: 'category' | 'details' | 'lessons'): void {
    if (step === 'category') {
      this.activeStep = step;
    } else if (step === 'details' && this.completedSteps['category']) {
      this.activeStep = step;
    } else if (step === 'lessons' && this.completedSteps['details']) {
      this.activeStep = step;
    } else {
      console.error(`Please complete the previous step first.`);
    }
  }

  onCategorySearch(): void {
    const text = this.categorySearchText.trim().toLowerCase();
    
    // Clear selection if input changes
    if (this.selectedCategory && this.selectedCategory.name.toLowerCase() !== text) {
        this.selectedCategory = null;
    }

    this.filteredCategories = this.hardcodedCategories.filter(cat =>
      cat.name.toLowerCase().includes(text)
    );
    
    this.categoryStatus = 'none'; // Reset status

    if (text.length > 0) {
        // Find exact match
        const exactMatch = this.hardcodedCategories.find(cat => cat.name.toLowerCase() === text);

        if (exactMatch) {
            // Found existing category (even by typing the full name)
            this.selectedCategory = exactMatch;
            this.filteredCategories = [exactMatch]; 
            this.categoryStatus = 'existing';
        } else if (this.filteredCategories.length === 0) {
            // No matches found, treat as new
            this.categoryStatus = 'new';
        }
        // If filteredCategories.length > 0 but no exact match, categoryStatus remains 'none'
        // which means the list of suggestions is displayed.
    } else {
        // Search text is empty
        this.filteredCategories = [...this.hardcodedCategories];
    }
  }

  selectCategory(category: CourseCategory): void {
    this.selectedCategory = category;
    this.categorySearchText = category.name;
    this.filteredCategories = []; 
    this.categoryStatus = 'existing'; // Explicitly set status when clicked from list
  }

  saveCategoryStep(): void {
    if (!this.selectedCategory && this.categorySearchText.trim().length === 0) {
      console.error("Please select or type a category name.");
      return;
    }

    if (!this.selectedCategory) {
      // Logic for creating a new category 
      const newCategory: CourseCategory = { id: Math.floor(Math.random() * 1000), name: this.categorySearchText.trim() };
      this.selectedCategory = newCategory;
    }

    this.courseData.categoryID = this.selectedCategory!.id;
    this.completedSteps['category'] = true;
    this.setActiveStep('details');
  }

  saveCourseDetails(): void {
    if (this.courseData.title.trim().length < 5 || this.courseData.syllabus.trim().length < 10) {
      console.error("Title and Syllabus must meet minimum length requirements.");
      return;
    }

    const newCourseId = 99;
    this.completedSteps['details'] = true;
    this.lessonData.courseID = newCourseId;
    this.lessons.forEach(l => l.courseID = newCourseId);

    this.setActiveStep('lessons');
  }

  onFileChange(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.lessonData.attachmentFile = fileList[0];
      this.lessonData.attachmentFileUrl = 'https://placehold.co/600x400/3f51b5/ffffff/pdf.pdf?text=' + encodeURIComponent(fileList[0].name);
    } else {
      this.lessonData.attachmentFile = null;
      this.lessonData.attachmentFileUrl = '';
    }
  }

  openAttachment(url: string, event: Event): void {
    event.stopPropagation();
    if (url) {
        window.open(url, '_blank');
    }
  }

  get isLessonFormValid(): boolean {
    const titleValid = this.lessonData.title.trim().length > 0;
    const videoUrlValid = this.lessonData.videoURL.trim().length > 0;
    const contentValid = this.lessonData.content.trim().length > 0;

    const attachmentRequired = this.lessonData.includeDocument;
    const attachmentProvided = !!this.lessonData.attachmentFile;

    const attachmentCheck = !attachmentRequired || attachmentProvided;

    return titleValid && videoUrlValid && contentValid && attachmentCheck;
  }

  saveLesson(): void {
    if (!this.isLessonFormValid) {
      console.error("Cannot save lesson. Check title, video URL, content, and file attachment status.");
      return;
    }

    if (this.lessonToEditIndex !== null) {
      this.lessons[this.lessonToEditIndex] = { ...this.lessonData };
      this.lessonToEditIndex = null;
    } else {
      const newLesson: Lesson = { ...this.lessonData, id: Math.floor(Math.random() * 1000) };
      this.lessons.push(newLesson);
    }

    this.lessonData = this.getNewLessonTemplate(this.lessons.length + 1);
  }

  editLesson(lesson: Lesson, index: number): void {
    this.lessonData = { ...lesson };
    this.lessonToEditIndex = index;
    this.expandedLessonId = null; 
  }

  removeLesson(index: number): void {
    this.lessons.splice(index, 1);
    this.lessons.forEach((l, i) => l.orderIndex = i + 1);
    this.lessonData.orderIndex = this.lessons.length + 1;
    this.lessonToEditIndex = null;
    this.lessonData = this.getNewLessonTemplate(this.lessons.length + 1);
    this.expandedLessonId = null;
  }

  viewLessonDetails(lesson: Lesson): void {
    if (this.expandedLessonId === lesson.id) {
      this.expandedLessonId = null;
    } else {
      this.expandedLessonId = lesson.id || null;
      this.lessonToEditIndex = null; // Exit edit mode if entering view mode
    }
  }

  saveAndFinish(): void {
    if (this.lessons.length === 0) {
      console.error("Cannot publish course without any lessons.");
      return;
    }
    console.log('Course creation complete! Redirecting...');
    this.router.navigate(['/instructor/courses']);
  }
}
