import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CourseInstructorService, CourseCategory, Course, Lesson } from '../../../services/course-creation-service'; 
import { catchError, of, tap } from 'rxjs';
import { MatSelect, MatOption } from "@angular/material/select";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatList, MatDivider, MatListItem } from "@angular/material/list";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar'; 

// --- ENHANCED MODELS FOR COMPONENT STATE ---

// Extends API CourseDetail with client-side fields
interface CourseFormData extends Partial<Course> {
  title: string;
  description: string;
  syllabus: string; // Additional field in HTML
  thumbnailURL: string; // Additional field in HTML
  level: 'Beginner' | 'Intermediate' | 'Expert'; // Additional field in HTML
  language: string; // Additional field in HTML
  duration: number; // Estimated Duration in Minutes
  categoryID: number; // No longer null
}

// Extends API Lesson with client-side fields
interface LessonFormData extends Partial<Lesson> {
  title: string;
  content: string; // Detailed content not required by API, but used in form
  videoURL: string; // Content source URL (not required by API, assumed handled on client)
  estimatedTime: number; // Used for form validation
  lessonType: 'Video'; // Hardcoded in template
  includeDocument: boolean;
  attachmentFile: File | null;
  attachmentFileUrl: string | null; // URL after upload (simulated)
}

// Map for Step completion status
type StepStatus = {
  [key: string]: boolean;
};

@Component({
  selector: 'app-instructor-createcourse',
  templateUrl: './instructor-createcourse.html',
  styleUrl: './instructor-createcourse.css',
  imports: [
    CommonModule, 
    FormsModule, 
    MatIcon, 
    MatSelect, 
    MatOption, 
    MatCard, 
    MatList, 
    MatDivider, 
    MatListItem, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatCardContent,
    // MatCardHeader, 
    // MatCardTitle, 
    MatProgressBarModule 
  ],
  standalone: true
})
export class InstructorCreateCourseComponent implements OnInit {
  // === DEPENDENCIES ===
  private courseService = inject(CourseInstructorService);
  private router = inject(Router);

  // === INSTRUCTOR ID STATE ===
  instructorId: number | null = null; 
  isInstructorIdReady: boolean = false; 

  // === STEP MANAGEMENT STATE ===
  activeStep: 'category' | 'details' | 'lessons' = 'category';
  completedSteps: StepStatus = {
    category: false,
    details: false,
    lessons: false,
  };
  courseId: number | null = null; // ID of the Course created in STEP 2
  isSaving: boolean = false; // Global saving state for buttons

  // === STEP 1: CATEGORY STATE ===
  allCategories: CourseCategory[] = [];
  filteredCategories: CourseCategory[] = [];
  categorySearchText: string = '';
  selectedCategory: Partial<CourseCategory> | null = null; // Use Partial to allow {name} only
  // 'none', 'existing', 'new'
  categoryStatus: 'none' | 'existing' | 'new' = 'none'; 
  newCategoryDescription: string = '';
  // NEW: Track the original description for change detection (Requirement 2)
  originalCategoryDescription: string | null = null; 

  // === STEP 2: COURSE DETAILS STATE ===
  courseData: CourseFormData = {
    title: '',
    description: '',
    syllabus: '',
    thumbnailURL: '',
    level: 'Beginner',
    language: 'English',
    duration: 10,
    categoryID: 0,
  };

  // === STEP 3: LESSONS STATE ===
  lessons: LessonFormData[] = [];
  lessonData: LessonFormData = this.resetLessonData();
  lessonToEditIndex: number | null = null;
  expandedLessonId: number | null = null; 

  // === INITIALIZATION ===
  ngOnInit(): void {
    this.fetchInstructorId();
    this.fetchCategories();
  }

  fetchInstructorId(): void {
    this.courseService.getCurrentInstructorId().subscribe({
      next: (id) => {
        this.instructorId = id;
        this.isInstructorIdReady = true;
        console.log(`Instructor ID fetched: ${id}`);
      },
      error: (err) => {
        console.error('Failed to fetch Instructor ID, defaulting to null:', err);
        this.isInstructorIdReady = true;
      }
    });
  }

  // --- STEP MANAGEMENT METHODS ---

  setActiveStep(step: 'category' | 'details' | 'lessons'): void {
    if (this.completedSteps['details'] && step === 'lessons') {
      this.activeStep = step;
    } else if (this.completedSteps['category'] && step === 'details') {
      this.activeStep = step;
    } else if (step === 'category') {
      this.activeStep = step;
    }
  }

  isFieldDisabled(step: string): boolean {
    if (step === 'category') {
      return this.completedSteps['details'];
    }
    if (step === 'details') {
      return this.completedSteps['lessons'];
    }
    return false;
  }
  
  // NEW: Validation for "Next" button in Category Step (Requirement 1 & 3)
  get isCategoryStepValid(): boolean {
    if (!this.selectedCategory) {
        return false;
    }

    // 1. Existing category selected (from list or previously created)
    if (this.selectedCategory.id) {
        // Check if the user is currently editing the description
        const isDescriptionModified = this.newCategoryDescription.trim() !== (this.originalCategoryDescription?.trim() || '');
        
        if (this.categoryStatus === 'existing' && isDescriptionModified) {
            // If modified, validate the new description length (Requirement 2 check)
            return this.newCategoryDescription.trim().length >= 10;
        }
        // If not modified, or status is just existing, it's valid to proceed (Requirement 3 check)
        return true; 
    }
    
    // 2. New category creation in progress (no ID yet)
    if (this.categoryStatus === 'new') {
        // Must have search text (name) and a valid description (Requirement 1 check)
        return this.categorySearchText.trim().length > 0 && this.newCategoryDescription.trim().length >= 10;
    }
    
    return false;
  }


  // --- STEP 1: CATEGORY LOGIC ---

  fetchCategories(): void {
    this.courseService.getAllCategories().subscribe({
      next: (categories) => {
        this.allCategories = categories;
        // If editing an existing course, pre-select the category
        if (this.courseData.categoryID > 0) {
            const initialCategory = categories.find(c => c.id === this.courseData.categoryID);
            if (initialCategory) {
                this.selectCategory(initialCategory);
            }
        }
      },
      error: (err) => {
        console.error('Failed to fetch categories:', err);
      }
    });
  }

  onCategorySearch(): void {
    const searchText = this.categorySearchText.trim().toLowerCase();
    
    if (!searchText) {
      this.categoryStatus = 'none';
      this.filteredCategories = this.allCategories;
      this.selectedCategory = null; 
      this.newCategoryDescription =  ''; 
      this.originalCategoryDescription = null; 
      return;
    }

    this.filteredCategories = this.allCategories.filter(cat =>
      cat.name.toLowerCase().includes(searchText)
    );

    const exactMatch = this.filteredCategories.find(cat => cat.name.toLowerCase() === searchText);
    
    if (exactMatch) {
      this.selectCategory(exactMatch);
    } else if (this.filteredCategories.length === 0 && searchText.length >= 3) {
      this.selectedCategory = { name: this.categorySearchText.trim() };
      this.categoryStatus = 'new';
      // If switching from 'existing' to 'new', clear the original description tracking
      if (!this.selectedCategory.id) {
         this.originalCategoryDescription = null; 
      }
    } else {
      this.categoryStatus = 'none';
      this.selectedCategory = null;
      this.newCategoryDescription = '';
      this.originalCategoryDescription = null;
    }
  }
  
  selectCategory(category: CourseCategory): void {
    this.selectedCategory = category;
    this.categorySearchText = category.name; 
    this.categoryStatus = 'existing';
    // Load existing description into the editable field and track the original (Requirement 2 setup)
    this.newCategoryDescription = category.description || ''; 
    this.originalCategoryDescription = category.description || ''; 
  }
  
  getSelectedCategoryName(): string {
    return this.selectedCategory?.name || 'N/A';
  }

  // Helper method to consolidate advancing logic
  private markStepCompleteAndAdvance(): void {
    this.isSaving = false;
    this.completedSteps['category'] = true;
    this.setActiveStep('details');
  }

  // Modified to handle update/create (Requirement 2 & 3)
  saveCategoryStep(): void {
    if (!this.selectedCategory || !this.isCategoryStepValid || this.isSaving) {
        console.error('Category step validation failed or already saving.');
        return;
    }

    this.isSaving = true;
    const currentName = this.categorySearchText.trim();
    const currentDescription = this.newCategoryDescription.trim();
    const categoryId = this.selectedCategory.id;

    // --- SCENARIO 1: EXISTING CATEGORY (Update/Proceed) ---
    if (categoryId) {
        this.courseData.categoryID = categoryId;
        
        // Check for modification (Requirement 2: Update)
        const isDescriptionModified = currentDescription !== (this.originalCategoryDescription?.trim() || '');
        
        if (isDescriptionModified) {
            // Update the category details in the API
            this.courseService.updateCategoryDetails({ 
                id: categoryId, 
                name: currentName, 
                description: currentDescription 
            } as CourseCategory)
            .pipe(
                tap((updatedCategory) => {
                    console.log('Existing category updated:', updatedCategory.id);
                    // Update the local list/state for consistency
                    const index = this.allCategories.findIndex(c => c.id === updatedCategory.id);
                    if(index !== -1) this.allCategories[index] = updatedCategory;
                    this.selectedCategory = updatedCategory;
                    this.originalCategoryDescription = updatedCategory.description || ''; 
                    this.markStepCompleteAndAdvance();
                }),
                catchError(err => {
                    console.error('Failed to update existing category:', err);
                    this.isSaving = false;
                    return of(null); 
                })
            ).subscribe();
        } else {
            // If no modification, just proceed (Requirement 3: Proceed)
            this.markStepCompleteAndAdvance();
        }
    } 
    // --- SCENARIO 2: NEW CATEGORY NEEDS CREATION ---
    else if (this.categoryStatus === 'new') {
        // API call to create the new category first
        this.courseService.createCategory({ name: currentName, description: currentDescription } as CourseCategory)
            .pipe(
                tap((newCategory) => {
                    console.log('New category created and ID received:', newCategory.id);
                    this.selectedCategory = newCategory;
                    this.allCategories.push(newCategory); // Add to local list
                    this.courseData.categoryID = newCategory.id!;
                    this.originalCategoryDescription = newCategory.description || ''; // Set original
                    this.markStepCompleteAndAdvance();
                }),
                catchError(err => {
                    console.error('Failed to create new category:', err);
                    this.isSaving = false;
                    return of(null); 
                })
            ).subscribe();
    } else {
        this.isSaving = false;
    }
  }

  // --- STEP 2: COURSE DETAILS LOGIC (Unchanged) ---

  saveCourseDetails(): void {
    const data = this.courseData;
    let validationFailed = false;

    if (data.categoryID === 0) {
        console.error('Validation failed: Category must be selected (categoryID is 0).');
        validationFailed = true;
    }

    if (!data.title || data.title.trim().length < 5) {
        console.error('Validation failed: Course Title is required and must be at least 5 characters.');
        validationFailed = true;
    }

    if (!data.description || data.description.trim().length < 20) {
        console.error('Validation failed: Course Description is required and must be at least 20 characters.');
        validationFailed = true;
    }
    
    if (data.duration <= 0) {
        console.error('Validation failed: Course Duration must be greater than 0.');
        validationFailed = true;
    }
    
    if (validationFailed) {
        console.error('Validation failed for course details.'); 
        return;
    }

    if (!this.isInstructorIdReady || this.instructorId === null) {
        console.error('Instructor ID is not available. Please wait for initialization.');
        return;
    }

    this.isSaving = true;

    const apiPayload: Course = {
        title: data.title,
        description: data.description,
        categoryID: data.categoryID, 
        duration: data.duration, 
        language: data.language, 
        level: data.level, 
        syllabus: data.syllabus || '', 
        thumbnailURL: data.thumbnailURL || 'https://placehold.co/400x225/333/FFF?text=Course+Image', 
        id: 0, 
        instructorId: this.instructorId, 
        status: 'Draft',
        lessons: [], 
      } as Course;

    const saveOperation = this.courseId
      ? this.courseService.updateCourseDetails(this.courseId, apiPayload)
      : this.courseService.createCourse(apiPayload);

    saveOperation.pipe(
      tap((course) => {
        this.courseId = course.id; 
        this.completedSteps['details'] = true;
        this.setActiveStep('lessons');
        this.isSaving = false;
        console.log(`Course ${this.courseId} details saved. Proceeding to lessons.`);
      }),
      catchError(err => {
        console.error('Failed to save course details:', err);
        this.isSaving = false;
        return of(null);
      })
    ).subscribe();
  }


  // --- STEP 3: LESSONS LOGIC (Unchanged) ---

  resetLessonData(): LessonFormData {
    return {
      title: '',
      content: '',
      videoURL: '',
      estimatedTime: 5,
      lessonType: 'Video',
      includeDocument: false,
      attachmentFile: null,
      attachmentFileUrl: null
    };
  }

  get isLessonFormValid(): boolean {
    const data = this.lessonData;
    const baseValid = data.title.trim().length > 3 && data.estimatedTime > 0 && data.videoURL.trim().length > 5;
    
    if (data.includeDocument) {
      return baseValid && (!!data.attachmentFile || !!data.attachmentFileUrl);
    }
    return baseValid;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.lessonData.attachmentFile = input.files[0];
      this.lessonData.attachmentFileUrl = `http://mock-cdn.lms.dev/files/${this.lessonData.attachmentFile.name}`;
    } else {
      this.lessonData.attachmentFile = null;
      this.lessonData.attachmentFileUrl = null;
    }
  }

  saveLesson(): void {
    if (!this.courseId || this.isSaving) return; 

    this.isSaving = true;

    const lessonPayload: Lesson = {
      courseId: this.courseId,
      title: this.lessonData.title,
      duration: this.lessonData.estimatedTime ?? 5,
      orderIndex: this.lessonToEditIndex !== null ? this.lessons[this.lessonToEditIndex].orderIndex ?? 1 : this.lessons.length + 1,
    };
    
    if (this.lessonToEditIndex !== null && this.lessons[this.lessonToEditIndex].id) {
        lessonPayload.id = this.lessons[this.lessonToEditIndex].id;
    }
    
    const saveOperation = lessonPayload.id
        ? this.courseService.updateLesson(lessonPayload)
        : this.courseService.createLesson(lessonPayload);

    saveOperation.pipe(
        tap((savedLesson) => {
            const localLessonData: LessonFormData = { ...this.lessonData, id: savedLesson.id, orderIndex: savedLesson.orderIndex };

            if (this.lessonToEditIndex !== null) {
                this.lessons[this.lessonToEditIndex] = localLessonData;
            } else {
                this.lessons.push(localLessonData);
            }

            this.lessonData = this.resetLessonData();
            this.lessonToEditIndex = null;
            this.completedSteps['lessons'] = true; 
            this.isSaving = false;
            console.log(`Lesson ${savedLesson.id} saved successfully.`);
        }),
        catchError(err => {
            console.error('Failed to save lesson:', err);
            this.isSaving = false;
            return of(null);
        })
    ).subscribe();
  }
  
  editLesson(lesson: LessonFormData, index: number): void {
    this.lessonData = { ...lesson }; 
    this.lessonToEditIndex = index;
    this.expandedLessonId = null; 
  }

  removeLesson(index: number): void {
    const lesson = this.lessons[index];
    if (!lesson.id) {
        this.lessons.splice(index, 1);
        return;
    }

    this.courseService.deleteLesson(lesson.id).subscribe({
      next: () => {
        this.lessons.splice(index, 1);
        this.lessons.forEach((l, i) => l.orderIndex = i + 1);
        if (this.lessonToEditIndex === index) {
            this.lessonData = this.resetLessonData();
            this.lessonToEditIndex = null;
        }
        console.log(`Lesson ${lesson.id} deleted successfully.`);
      },
      error: (err) => {
        console.error('Failed to delete lesson:', err);
      }
    });
  }

  viewLessonDetails(lesson: LessonFormData): void {
    this.expandedLessonId = this.expandedLessonId === lesson.id ? null : lesson.id!;
  }

  openAttachment(url: string, event: MouseEvent): void {
    event.stopPropagation(); 
    window.open(url, '_blank');
  }

  // --- FINALIZATION (Unchanged) ---

  saveAndFinish(): void {
    if (!this.courseId || this.lessons.length === 0 || this.isSaving) return;

    this.isSaving = true;
    
    this.courseService.updateCourseStatus(this.courseId, 'Published').subscribe({
      next: () => {
        this.isSaving = false;
        console.log(`Course ${this.courseId} successfully PUBLISHED!`);
        this.router.navigate(['/instructor/course-details', this.courseId]);
      },
      error: (err) => {
        console.error('Failed to publish course:', err);
        this.isSaving = false;
      }
    });
  }
}
