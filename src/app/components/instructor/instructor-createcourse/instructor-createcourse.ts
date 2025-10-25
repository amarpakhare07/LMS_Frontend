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

// @NgModule({
//   imports: [
//     CommonModule,
//     FormsModule,
//     RouterModule,
//     // Angular Material:
//     MatCardModule,
//     MatIconModule,
//     MatButtonModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatCheckboxModule,
//     MatListModule,
//     MatDividerModule,
//     MatTooltipModule,
//   ]
// })

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
    duration: null,
    categoryId: null,
    categoryName: null,
    categoryDescription: null,
    status: 'Draft',
  };

  // --- Step 3: Lesson Data ---
  lessons: Lesson[] = [];
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

        this.lessons = lessons.map(l => ({
          id: (l.id === undefined ? null : l.id) as number | null,
          courseId: this.courseId,
          title: l.title,
          orderIndex: l.orderIndex,
          estimatedTime: l.duration,
          content: 'Loaded content...',
          lessonType: 'Video',
          videoURL: 'https://video.link/loaded',
          includeDocument: false,
          attachmentFileUrl: null
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
      this.selectedCategory = this.allCategories.find(c => c.id === course.categoryId) || { id: course.categoryId, name: course.categoryName!, description: course.categoryDescription || '' };
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
      estimatedTime: null,
      orderIndex: this.lessons.length + 1,
      videoURL: '',
      includeDocument: false,
      attachmentFileUrl: null,
      attachmentFile: null,
    } as Lesson;
  }

  // =========================================================================
  //                             STEP 1: CATEGORY ACTIONS
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
    this.courseData.categoryId = cat.id;
    this.courseData.categoryName = cat.name;
    this.courseData.categoryDescription = cat.description;
  }

  isCategoryStepValid(): boolean {
    if (this.categoryStatus === 'existing' && this.selectedCategory && this.selectedCategory.id > 0) {
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
        const newCatDetails = { name: this.categorySearchText.trim(), description: this.newCategoryDescription.trim() };
        category$ = this.courseService.createCategory(newCatDetails).pipe(
            tap(newCategory => this.allCategories.push(newCategory))
        );
    } else {
        category$ = of(this.selectedCategory!);
    }
    
    // 2. Perform Category Action and ONLY update local state
    category$.subscribe({
        next: (cat) => { 
            this.courseData.categoryId = cat.id;
            this.courseData.categoryName = cat.name;
            this.courseData.categoryDescription = cat.description;
            
            this.completedSteps.category = true;
            console.log('Category saved/selected successfully.');
            
            // 💡 2a. Set loading to false on success
            this.isLoading = false; 

            if (next) {
                this.setActiveStep('details'); 
            }
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
  // =========================================================================

  isCourseDetailsValid(): boolean {
    // Checks that the course ID exists (i.e., step 1 was completed)
    return !!this.courseId &&
      this.courseData.title.trim().length >= 5 &&
      this.courseData.description.trim().length >= 10 &&
      this.courseData.syllabus.trim().length >= 10 &&
      !!this.courseData.level &&
      !!this.courseData.language;
  }

  saveDetailsStep(next: boolean = false) {
    if (!this.isCourseDetailsValid() || !this.courseId) {
      console.warn('Validation failed or Course ID is missing.');
      return;
    }

    // Partial update payload for API
    const updates: Partial<CourseDetail & { syllabus: string, level: string, language: string, thumbnailURL: string }> = {
      title: this.courseData.title,
      description: this.courseData.description,
      // Assuming these extended fields are also accepted by your PUT /api/Course/{id} endpoint
      syllabus: this.courseData.syllabus,
      level: this.courseData.level,
      language: this.courseData.language,
      thumbnailURL: this.courseData.thumbnailURL
    };

    this.courseService.updateCourseDetails(this.courseId, updates).subscribe({
      next: (updatedCourse) => {
        this.courseData = { ...this.courseData, ...updatedCourse }; // Update local state
        this.completedSteps.details = true;

        if (next) {
          this.setActiveStep('lessons');
        } else {
          console.log('Course Details saved successfully.');
        }
      },
      error: (err) => console.error('API Error: Course Details save failed', err)
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

    const isAttachmentValid = !this.lessonData.includeDocument || !!this.lessonData.attachmentFile;

    return isBaseValid && isAttachmentValid;
  }

  onFileChange(event: Event) {
    // ... (logic remains the same - handles local file object)
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

    // 1. Prepare Service Lesson Payload
    const lessonPayload: Omit<ServiceLesson, 'id'> = {
      courseId: this.courseId,
      title: this.lessonData.title,
      duration: this.lessonData.estimatedTime!, // Use estimatedTime as duration
      orderIndex: this.lessonData.orderIndex,
      // Note: Other local fields like content, videoURL, attachment are not directly in your ServiceLesson model. 
      // You must extend your ServiceLesson or create a separate API endpoint for these extended details.
      // For this code, we only send what the service expects.
    };

    let lessonAction$: Observable<ServiceLesson>;

    if (this.lessonData.id) {
      // Update existing lesson
      const fullLesson: ServiceLesson = { ...lessonPayload, id: this.lessonData.id };
      lessonAction$ = this.courseService.updateLesson(fullLesson);
    } else {
      // Create new lesson
      lessonAction$ = this.courseService.createLesson(lessonPayload);
    }

    lessonAction$.subscribe({
      next: (savedServiceLesson) => {
        const savedLesson: Lesson = {
          ...this.lessonData,
          id: savedServiceLesson.id,
          orderIndex: savedServiceLesson.orderIndex,
          estimatedTime: savedServiceLesson.duration,
          courseId: savedServiceLesson.courseId
          // NOTE: Local fields like videoURL, content need explicit saving if not in ServiceLesson.
        };

        const index = this.lessons.findIndex(l => l.id === savedLesson.id);

        if (index !== -1) {
          this.lessons[index] = savedLesson;
        } else {
          this.lessons.push(savedLesson);
        }

        this.completedSteps.lessons = this.lessons.length > 0;
        this.lessons.forEach((l, i) => l.orderIndex = i + 1);
        // this.resetLessonForm();
        console.log('Lesson saved successfully:', savedLesson.title);
      },
      error: (err) => console.error('API Error: Lesson save failed', err)
    });
  }

  editLesson(lesson: Lesson, index: number) {
    this.lessonToEditIndex = index;
    this.lessonData = { ...lesson };
  }

  removeLesson(index: number) {
    const lessonId = this.lessons[index].id;
    if (!lessonId || !confirm('Are you sure you want to remove this lesson?')) {
      return;
    }

    this.courseService.deleteLesson(lessonId).subscribe({
      next: () => {
        this.lessons.splice(index, 1);
        this.lessons.forEach((l, i) => l.orderIndex = i + 1);
        this.completedSteps.lessons = this.lessons.length > 0;
        // this.resetLessonForm();
        this.expandedLessonId = null;
        console.log('Lesson deleted successfully.');
      },
      error: (err) => console.error('API Error: Lesson delete failed', err)
    });
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
    this.expandedLessonId = this.expandedLessonId === lesson.id ? null : lesson.id;
  }
}