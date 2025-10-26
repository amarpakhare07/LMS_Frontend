import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 Essential for data binding
import { RouterModule } from '@angular/router'; // 👈 Essential for navigation
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import {
  CourseInstructorService,
  CourseCategory,
  CourseDetail,
  Course,
  Lesson as ServiceLesson // Renamed to avoid collision with local Lesson interface
} from '../../../services/course-creation-service';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// --- LOCAL INTERFACES (AUGMENTED from Service) ---

// Extend Service's CourseCategory for local state management
interface Category extends CourseCategory { }

// Local CourseData must hold all fields needed across the flow
interface CourseData {
  id: number | null;
  instructorId: number | null;
  title: string;
  description: string;
  syllabus: string; // Assuming this is part of the detail update in Step 2
  thumbnailURL: string; // Assuming this is part of the detail update in Step 2
  level: 'Beginner' | 'Intermediate' | 'Expert' | string; // Assuming this is part of the detail update in Step 2
  language: string; // Assuming this is part of the detail update in Step 2
  duration: number | null; // Total duration based on lessons (calculated) or initial estimate
  categoryId: number | null;
  categoryName: string | null;
  categoryDescription: string | null;
  status: 'Draft' | 'Published';
}

// Local Lesson interface, augmented for UI/upload features
interface Lesson {
  id?: number | null;
  courseId: number | null;
  title: string;
  content: string; // Detailed content (not in service, assumed local/extended detail)
  lessonType: 'Video';
  estimatedTime: number | null;
  orderIndex: number; // For UI sorting
  videoURL: string; // Assumed part of the lesson detail
  includeDocument: boolean;
  attachmentFileUrl: string | null; // URL after successful upload
  attachmentFile?: File | null; // Client-side file object for upload
}

// --- MAIN COMPONENT ---

@Component({
  selector: 'app-instructor-createcourse',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    // Angular Material:
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './instructor-createcourse.html',
  styleUrls: ['./instructor-createcourse.css'],

})
export class InstructorCreateCourseComponent implements OnInit {
  // --- Services and Dependencies ---
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private courseService: CourseInstructorService // Injected Service
  ) { }

  // --- Step Tracking & State ---
  activeStep: 'category' | 'details' | 'lessons' | 'preview' = 'category';
  completedSteps: {
    category: boolean,
    details: boolean,
    lessons: boolean,
    // Note: 'preview' is usually not here as it's the final action step
  } = {
      category: false,
      details: false,
      lessons: false,
    };
  isLoading: boolean = true;
  courseId: number | null = null;
  instructorId: number | null = null;

  // --- Step 1: Category Data ---
  allCategories: Category[] = [];
  categorySearchText: string = '';
  filteredCategories: Category[] = [];
  selectedCategory: Category | null = null;
  categoryStatus: 'none' | 'existing' | 'new' = 'none';
  newCategoryDescription: string = '';

  // --- Step 2: Course Details Data ---
  courseData: CourseData = {
    id: null,
    instructorId: null,
    title: '',
    description: '',
    syllabus: '',
    thumbnailURL: '',
    level: 'Beginner',
    language: 'English',
    duration: 10,
    categoryId: null,
    categoryName: null,
    categoryDescription: null,
    status: 'Draft',
  };

  // --- Step 3: Lesson Data ---
  lessons: Lesson[] = [];
  // Initialize lessonData using the template to set defaults
  lessonData: Lesson = this.getNewLessonTemplate();
  lessonToEditIndex: number | null = null;
  expandedLessonId: number | null | undefined = null;

  // =========================================================================
  //                             LIFECYCLE HOOKS & DATA LOAD
  // =========================================================================

  ngOnInit(): void {
    // 1. Get instructor ID and course ID from route (if editing)
    this.courseService.getCurrentInstructorId().pipe(
      tap(instructorId => {
        this.instructorId = instructorId; // Set the ID immediately
        this.courseData.instructorId = instructorId;
        if (!instructorId) {
          // Critical failure: If the API returns 0 or null, we stop.
          console.error("CRITICAL: Instructor ID could not be loaded from the service.");
          this.isLoading = false;
          return;
        }
      }),
      // 2. Load Course ID from route and All Categories
      switchMap(instructorId => forkJoin({
        categories: this.courseService.getAllCategories(),
        courseIdFromRoute: this.route.paramMap.pipe(
          // Use distinctUntilChanged if you are worried about multiple param emissions
          tap(params => {
            const id = params.get('courseId');
            this.courseId = id ? +id : null;
          }),
          switchMap(() => of(this.courseId))
        )
      })),
      tap(({ categories }) => {
        this.allCategories = categories;
        this.filteredCategories = categories;
      }),
      // 3. Load existing course data if ID is present (Mock or Real API call)
      switchMap(({ courseIdFromRoute }) => {
        if (courseIdFromRoute) {
          // MOCK: Replace with actual course data loading from API
          return forkJoin({
            lessons: this.courseService.getLessonsByCourse(courseIdFromRoute),
            // You must ADD this method: getCourseById(id: number) to your service
            // courseDetails: this.courseService.getCourseById(courseIdFromRoute) 
            // Using a mock observable until you add getCourseById:
            courseDetails: of({
              title: "Loaded Title", description: "Loaded Description", categoryId: 1,
              categoryName: "Web Development", categoryDescription: "Learn to build...", status: 'Draft'
            } as Partial<CourseData>)
          });
        }
        return of({ lessons: [], courseDetails: null });
      }),
      // 4. Update component state with loaded course data and lessons
      tap(({ lessons, courseDetails }) => {
        if (courseDetails) {
          this.updateStateFromCourseData(courseDetails as CourseData);
        }

        // Map service lessons to local augmented Lesson interface
        this.lessons = lessons.map(l => ({
          id: (l.id === undefined ? null : l.id) as number | null,
          courseId: this.courseId,
          title: l.Title,
          orderIndex: l.OrderIndex,
          estimatedTime: l.EstimatedTime,
          content: 'Loaded content...', // Placeholder for content fetching
          lessonType: 'Video',
          videoURL: 'https://video.link/loaded', // Placeholder for video fetching
          includeDocument: false, // Placeholder for attachment state
          attachmentFileUrl: null // Placeholder for attachment URL
        }));

        this.completedSteps.lessons = this.lessons.length > 0;
        this.setActiveStepInitial();
        this.isLoading = false;
      }),
      catchError(err => {
        console.error('Failed to load initial course data:', err);
        this.isLoading = false;
        return of(null);
      })
    ).subscribe();
  }

  private updateStateFromCourseData(course: CourseData) {
    // Merge the loaded course details into the local state
    this.courseData = { ...this.courseData, ...course, id: course.id || this.courseId, instructorId: this.instructorId };

    if (course.categoryId && course.categoryName) {
      this.completedSteps.category = true;
      this.selectedCategory = this.allCategories.find(c => c.categoryID === course.categoryId) || { categoryID: course.categoryId, name: course.categoryName!, description: course.categoryDescription || '' };
      this.categorySearchText = course.categoryName;
      this.categoryStatus = 'existing';
    }

    if (course.title && course.description) {
      this.completedSteps.details = true;
    }
  }

  private setActiveStepInitial() {
    if (!this.completedSteps.category) {
      this.activeStep = 'category';
    } else if (!this.completedSteps.details) {
      this.activeStep = 'details';
    } else if (!this.completedSteps.lessons) {
      this.activeStep = 'lessons';
    } else {
      this.activeStep = 'preview';
    }
  }


  private getNewLessonTemplate(): Lesson {
    return {
      id: null,
      courseId: this.courseId,
      title: '',
      content: '',
      lessonType: 'Video',
      estimatedTime: 10, // 👈 CHANGE: Set default duration to 10 minutes
      orderIndex: this.lessons.length + 1,
      videoURL: '',
      includeDocument: false,
      attachmentFileUrl: null,
      attachmentFile: null,
    } as Lesson;
  }

  // New helper function to reset the form after save or cancel
  private resetLessonForm(): void {
    this.lessonToEditIndex = null;
    this.lessonData = this.getNewLessonTemplate();
    this.lessonData.orderIndex = this.lessons.length + 1; // Correct order index for the next new lesson
    this.expandedLessonId = null; // Collapse any expanded lesson on form reset
    console.log('Lesson form reset to Add New Lesson mode.');
  }

  // =========================================================================
  //                             STEP 1: CATEGORY ACTIONS
  // (No changes needed here based on the lesson section request)
  // =========================================================================

  onCategorySearch() {
    this.selectedCategory = null;
    this.categoryStatus = 'none';

    if (!this.categorySearchText.trim()) {
      this.filteredCategories = this.allCategories;
      return;
    }

    const searchTextLower = this.categorySearchText.trim().toLowerCase();
    const match = this.allCategories.find(cat => cat.name.toLowerCase() === searchTextLower);

    if (match) {
      this.selectCategory(match);
      this.filteredCategories = [];
    } else {
      this.categoryStatus = 'new';
      this.filteredCategories = this.allCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchTextLower)
      );
    }
  }

  selectCategory(cat: CourseCategory) {
    this.selectedCategory = cat;
    this.categorySearchText = cat.name; // Keep the search text synchronized
    this.categoryStatus = 'existing'; // Mark status as existing
    // Ensure the course data is populated immediately for validation/display
    this.courseData.categoryId = cat.categoryID;
    this.courseData.categoryName = cat.name;
    this.courseData.categoryDescription = cat.description;
  }

  isCategoryStepValid(): boolean {
    if (this.categoryStatus === 'existing' && this.selectedCategory && this.selectedCategory.categoryID > 0) {
      return true;
    }

    if (this.categoryStatus === 'new' && this.categorySearchText.trim().length > 0 && this.newCategoryDescription.trim().length >= 10) {
      return true;
    }

    return false;
  }
  saveCategoryStep(next: boolean = false) {
    if (!this.isCategoryStepValid() || !this.instructorId) {
      console.warn('Validation failed or Instructor ID is missing.');
      return;
    }

    // 💡 1. Set loading to true before the API call
    this.isLoading = true;

    let category$: Observable<CourseCategory>;

    // 1. Determine Category Action (Create New or Use Existing)
    if (this.categoryStatus === 'new') {
      const newCatDetails = { name: this.categorySearchText.trim(), description: this.newCategoryDescription.trim(), categoryID: 0 };
      category$ = this.courseService.createCategory(newCatDetails).pipe(
        tap(newCategory => this.allCategories.push(newCategory))
      );
    } else {
      category$ = of(this.selectedCategory!);
    }

    category$.subscribe({
      next: (cat) => {
        const categoryIdFromApi = cat.categoryID; // 👈 FIX: Read from categoryID

        // 1. Check if the ID is valid
        if (typeof categoryIdFromApi !== 'number' || categoryIdFromApi <= 0) {
          console.error('API failed to return a valid Category ID (categoryID <= 0).', cat);
          this.isLoading = false;
          return;
        }

        // 2. Update the local state with the valid ID
        this.courseData.categoryId = categoryIdFromApi;
        this.courseData.categoryName = cat.name;
        this.courseData.categoryDescription = cat.description;

        this.completedSteps.category = true;
        console.log('Category saved/selected successfully. ID:', categoryIdFromApi);

        this.isLoading = false;

        
      },
      error: (err) => {
        console.error('API Error: Category save failed', err);
        // 💡 2b. Set loading to false on error
        this.isLoading = false;
      }
    });
  }

  // =========================================================================
  //                             STEP 2: DETAILS ACTIONS
  // (No changes needed here based on the lesson section request)
  // =========================================================================

  isCourseDetailsValid(): boolean {
    const data = this.courseData;

    // 1. Core Metadata Validation: Ensure the result of the expression is explicitly a boolean.
    const isTitleValid: boolean = !!(data.title && data.title.trim().length >= 5);
    const isDescriptionValid: boolean = !!(data.description && data.description.trim().length >= 10);
    const isSyllabusValid: boolean = !!(data.syllabus && data.syllabus.trim().length >= 10);

    // 2. Selection/Numeric Validation:
    const isLevelValid: boolean = !!data.level;
    const isLanguageValid: boolean = !!(data.language && data.language.trim().length >= 2);

    const isDurationValid: boolean = typeof data.duration === 'number' && data.duration > 0;

    // 3. Final Return: The combination of strict boolean variables is now safe.
    return (
      isTitleValid &&
      isDescriptionValid &&
      isSyllabusValid &&
      isLevelValid &&
      isLanguageValid &&
      isDurationValid
    );
  }

  saveDetailsStep(next: boolean = false) {
    this.isLoading = true;

    // 1. Validation Check (Details fields must be valid)
    if (!this.isCourseDetailsValid()) {
      console.warn('Validation failed: Course Details are incomplete or invalid.');
      this.isLoading = false;
      return;
    }

    // CRITICAL PRE-REQUISITE: The category ID MUST be available from the previous step.
    if (!this.courseData.categoryId) { // Local state uses camelCase 'categoryId'
      console.error('Cannot create course: Category ID is required but missing.');
      this.isLoading = false;
      return;
    }

    // 2. Prepare Payload for Course Creation (POST API Call)
    const createPayload = {
      title: this.courseData.title,
      description: this.courseData.description,
      syllabus: this.courseData.syllabus,
      level: this.courseData.level,
      language: this.courseData.language,
      thumbnailURL: this.courseData.thumbnailURL,
      duration: this.courseData.duration,
      categoryID: this.courseData.categoryId, // PascalCase to match DTO
      published: false
    };

    // 3. Execute Course Creation (POST)
    this.courseService.createCourse(createPayload).subscribe({
      next: (newCourse) => {
        // 👈 CRITICAL FIX: Robustly check for ID property, assuming the API might return 'ID' or 'CourseID'.
        const courseIdFromApi = (newCourse as any).courseID || (newCourse as any).CourseID || (newCourse as any).ID || newCourse.id;

        if (typeof courseIdFromApi !== 'number' || courseIdFromApi <= 0) {
          console.error('API returned success but failed to provide a valid Course ID.', newCourse);
          this.isLoading = false;
          return;
        }

        this.courseId = courseIdFromApi; // 👈 This will now correctly store the ID.
        this.courseData = { ...this.courseData, ...newCourse };
        this.completedSteps.details = true;
        this.isLoading = false;

        if (next) {
          this.setActiveStep('lessons');
        } else {
          console.log('New Course created successfully with ID:', this.courseId);
        }
      },
      error: (err) => {
        console.error('API Error: Course creation failed', err);
        this.isLoading = false;
      }
    });
  }

  // =========================================================================
  //                             STEP 3: LESSON ACTIONS
  // =========================================================================

  get isLessonFormValid(): boolean {
    const isBaseValid = this.lessonData.title.trim().length >= 3 &&
      this.lessonData.estimatedTime !== null &&
      this.lessonData.estimatedTime! > 0 &&
      !!this.lessonData.videoURL; // Require video for simplicity

    // Validate attachment only if the checkbox is checked
    const isAttachmentValid = !this.lessonData.includeDocument || !!this.lessonData.attachmentFile;

    return isBaseValid && isAttachmentValid;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.lessonData.attachmentFile = file;
      this.lessonData.attachmentFileUrl = `/temp-upload/${file.name}`; // Temporary client URL
    } else {
      this.lessonData.attachmentFile = null;
      this.lessonData.attachmentFileUrl = null;
    }
  }

  saveLesson() {
    if (!this.courseId || !this.isLessonFormValid) {
      console.warn('Cannot save lesson. Course ID missing or form is invalid.');
      return;
    }

    this.isLoading = true;

    // NOTE ON ATTACHMENT: In a real app, you would upload the file here
    // and wait for the permanent URL before continuing with the lesson metadata save.
    // 
    // // TODO: Implement file upload logic here:
    // let attachmentUpload$ = of(this.lessonData.attachmentFileUrl); // Default to current URL or null
    // if (this.lessonData.includeDocument && this.lessonData.attachmentFile) {
    //   attachmentUpload$ = this.courseService.uploadAttachment(this.lessonData.attachmentFile).pipe(
    //     tap(url => this.lessonData.attachmentFileUrl = url)
    //   );
    // }

    // attachmentUpload$.pipe(
    //   switchMap(() => {
    //     // 1. Prepare Service Lesson Payload
    //     const lessonPayload = {
    //       CourseID: this.courseId!,
    //       Title: this.lessonData.title,
    //       Content: this.lessonData.content,
    //       VideoURL: this.lessonData.videoURL,
    //       OrderIndex: this.lessonData.orderIndex,
    //       LessonType: this.lessonData.lessonType,
    //       EstimatedTime: this.lessonData.estimatedTime!,
    //       AttachmentURL: this.lessonData.attachmentFileUrl // Include final URL
    //     };

    //     let lessonAction$: Observable<ServiceLesson>;
    //     // ... rest of the logic
    //   })
    // ).subscribe({...});


    // Using the current structure for simplicity in this example:
    const lessonPayload = {
      CourseID: this.courseId!, // Should map to CourseID
      Title: this.lessonData.title,
      Content: this.lessonData.content,
      VideoURL: this.lessonData.videoURL,
      OrderIndex: this.lessonData.orderIndex,
      LessonType: this.lessonData.lessonType,
      EstimatedTime: this.lessonData.estimatedTime!,
      // Assuming ServiceLesson doesn't strictly need all local fields:
    };

    let lessonAction$: Observable<ServiceLesson>;

    if (this.lessonData.id) {
      // Update existing lesson
      const fullLesson: ServiceLesson = { ...lessonPayload, id: this.lessonData.id };
      lessonAction$ = this.courseService.updateLesson(fullLesson);
    } else {
      // Create new lesson
      lessonAction$ = this.courseService.createLesson(lessonPayload as Omit<ServiceLesson, 'id'>);
    }

    lessonAction$.subscribe({
      next: (savedServiceLesson) => {
        // Map saved service lesson back to local Lesson interface
        const savedLesson: Lesson = {
          ...this.lessonData, // Keep all local fields (content, attachmentFile, etc.)
          id: savedServiceLesson.id,
          orderIndex: savedServiceLesson.OrderIndex,
          estimatedTime: savedServiceLesson.EstimatedTime,
          courseId: savedServiceLesson.CourseID
        };

        const index = this.lessons.findIndex(l => l.id === savedLesson.id);

        if (index !== -1) {
          this.lessons[index] = savedLesson;
          console.log('Lesson updated successfully:', savedLesson.title);
        } else {
          this.lessons.push(savedLesson);
          console.log('New Lesson created successfully:', savedLesson.title);
        }

        // 💡 REQUIRED CHANGE: Reset the form after save/update
        this.resetLessonForm();

        this.completedSteps.lessons = this.lessons.length > 0;
        this.lessons.forEach((l, i) => l.orderIndex = i + 1); // Re-index all lessons
        this.isLoading = false;
      },
      error: (err) => {
        console.error('API Error: Lesson save failed', err);
        this.isLoading = false;
      }
    });
  }

  editLesson(lesson: Lesson, index: number) {
    // 💡 REQUIRED CHANGE: Ensure we copy all fields including the file object placeholders
    this.lessonToEditIndex = index;
    this.lessonData = { ...lesson };
    // Collapse all other lessons when editing one
    this.expandedLessonId = null;
  }

  // New method for the Cancel Edit button
  cancelEdit(): void {
    this.resetLessonForm();
  }

private finalizeRemove(index: number) {
    this.lessons.splice(index, 1); // Remove from the local array
    this.lessons.forEach((l, i) => l.orderIndex = i + 1); // Re-index all lessons
    this.completedSteps.lessons = this.lessons.length > 0;
    this.resetLessonForm(); // Reset form back to "Add New Lesson" mode
    this.isLoading = false;
    console.log('Lesson deleted/removed successfully.');
}

/**
 * Handles the removal of a lesson.
 * - If lesson has an ID, it calls the API to delete from the database.
 * - If lesson has no ID (unsaved), it removes it only from the local list.
 */
removeLesson(index: number) {
    const lesson = this.lessons[index];
    const lessonId = lesson.id;
    
    // 1. Confirmation Pop-up
    if (!confirm(`Are you sure you want to remove lesson #${lesson.orderIndex}: ${lesson.title}?`)) {
        return; // User canceled the removal
    }
    
    // 2. CHECK: If the lesson is SAVED (has an ID)
    if (lessonId) {
        this.isLoading = true;
        
        // --- DATABASE DELETION VIA API CALL ---
        this.courseService.deleteLesson(lessonId).subscribe({
            next: () => {
                console.log(`✅ API Success: Lesson ID ${lessonId} deleted from database.`);
                // Only proceed to update the UI if the API call was successful
                this.finalizeRemove(index); 
            },
            error: (err) => {
                console.error('❌ API Error: Lesson delete failed', err);
                this.isLoading = false;
            }
        });
    } else {
        // 3. ALTERNATE: Lesson is UNSAVED (no ID)
        console.warn('⚠️ Lesson has no ID. Removing from local list only.');
        // Remove locally without an API call
        this.finalizeRemove(index); 
    }
}

  saveLessonsStep(next: boolean = false) {
    if (this.lessons.length === 0) {
      console.warn('You must add at least one lesson before proceeding.');
      return;
    }

    // Final check/state update before proceeding
    this.completedSteps.lessons = true;

    if (next) {
      this.setActiveStep('preview');
    } else {
      console.log('Lesson structure confirmed. Ready for Preview.');
    }
  }

  // =========================================================================
  //                             STEP 4: PUBLISH ACTIONS
  // =========================================================================

  saveAndFinish() {
    if (!this.courseId || this.lessons.length === 0) {
      console.warn('Cannot publish: Course ID missing or no lessons.');
      return;
    }

    this.courseService.updateCourseStatus(this.courseId, 'Published').subscribe({
      next: () => {
        this.courseData.status = 'Published';
        console.log('Course Published!');
        // Navigate back to the course list
        this.router.navigate(['/instructor/courses']);
      },
      error: (err) => console.error('API Error: Publish failed', err)
    });
  }

  // =========================================================================
  //                             UI/NAVIGATION HELPERS
  // =========================================================================

  setActiveStep(step: 'category' | 'details' | 'lessons' | 'preview') {
    // Existing navigation logic
    if (step === 'details' && !this.completedSteps.category) return;
    if (step === 'lessons' && !this.completedSteps.details) return;
    if (step === 'preview' && !this.completedSteps.lessons) return;

    this.activeStep = step;
  }

  isFieldDisabled(step: 'category' | 'details'): boolean {
    return this.completedSteps[step] && this.activeStep !== step;
  }

  viewLessonDetails(lesson: Lesson) {
    // Toggle the expanded state for the clicked lesson
    this.expandedLessonId = this.expandedLessonId === lesson.id ? null : lesson.id;
  }
}