import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 

// --- Material UI Imports ---
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
  duration: number; 
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
    MatCardModule, MatListModule, MatTooltipModule
  ],
  templateUrl: './instructor-createcourse.html',
  styleUrls: ['./instructor-createcourse.css']
})
export class InstructorCreateCourseComponent implements OnInit {
  activeStep: 'category' | 'details' | 'lessons' = 'category';
  
  completedSteps: { [key: string]: boolean } = {
    category: false,
    details: false
  };

  categorySearchText: string = '';
  selectedCategory: CourseCategory | null = null;
  
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
  
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.filteredCategories = [...this.hardcodedCategories];
    // IMPORTANT FIX: Removed initial setup to ensure a clean start for the category selection.
    // this.selectedCategory is now null, and completedSteps['category'] is false.
  }
  
  getNewLessonTemplate(orderIndex: number): Lesson {
    return {
      courseID: 0, 
      title: '', content: '', videoURL: '',
      orderIndex: orderIndex, lessonType: 'Video',
      estimatedTime: 15, 
      includeDocument: false, 
      attachmentFile: null
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
      const requiredStep = step === 'details' ? 'Category' : 'Course Details';
      console.error(`Please complete the ${requiredStep} step first.`);
    }
  }

  onCategorySearch(): void {
    const text = this.categorySearchText.toLowerCase();
    this.filteredCategories = this.hardcodedCategories.filter(cat => 
      cat.name.toLowerCase().includes(text)
    );
    this.selectedCategory = null; 
  }

  selectCategory(category: CourseCategory): void {
    this.selectedCategory = category;
    this.categorySearchText = category.name;
    this.filteredCategories = []; 
  }

  saveCategoryStep(): void {
    if (!this.selectedCategory && this.categorySearchText.trim().length === 0) {
      console.error("Please select or type a category name.");
      return;
    }
    
    if (!this.selectedCategory) {
      const newCategory: CourseCategory = { id: Math.floor(Math.random() * 1000), name: this.categorySearchText.trim() };
      this.selectedCategory = newCategory;
    }
    
    this.courseData.categoryID = this.selectedCategory!.id;
    this.completedSteps['category'] = true;
    this.setActiveStep('details');
  }

  saveCourseDetails(): void {
    if (this.courseData.title.trim().length < 5) {
      console.error("Course Title must be at least 5 characters long.");
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
    } else {
      // If the user cancels the file dialog after checking the box
      this.lessonData.attachmentFile = null;
    }
  }

  /**
   * FIX: Added validation for lesson form, including checking for an attached file 
   * if the includeDocument checkbox is checked.
   */
  get isLessonFormValid(): boolean {
    const titleValid = this.lessonData.title.trim().length > 0;
    
    const attachmentRequired = this.lessonData.includeDocument;
    const attachmentProvided = !!this.lessonData.attachmentFile;

    // Valid if: (Title is OK) AND (If attachment is required, it must be provided)
    const attachmentCheck = !attachmentRequired || attachmentProvided;

    return titleValid && attachmentCheck;
  }
  expandedLessonId: number | null = null;
  
  saveLesson(): void {
    // Validation is now handled by the isLessonFormValid getter on the button
    if (!this.isLessonFormValid) {
        console.error("Cannot save lesson. Check title and file attachment status.");
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
    // When editing, we clear the local file object to force re-upload if document is still required.
    // In a real application, you would load metadata about the existing file here.
    this.lessonData.attachmentFile = null; 
  }

  removeLesson(index: number): void {
    this.lessons.splice(index, 1);
    this.lessons.forEach((l, i) => l.orderIndex = i + 1);
    this.lessonData.orderIndex = this.lessons.length + 1;
    this.lessonToEditIndex = null;
    this.lessonData = this.getNewLessonTemplate(this.lessons.length + 1);
  }

  /**
   * FIX: Added method to simulate viewing lesson details and attachment link.
   */
  viewLessonDetails(lesson: Lesson): void {
    if (this.expandedLessonId === lesson.id) {
      this.expandedLessonId = null; // Collapse if already open
    } else {
      this.expandedLessonId = lesson.id || null; // Expand the new lesson
    }
    
    // Keep the console log for backend simulation/debugging
    console.log('Lesson Toggle Action:', lesson.title, this.expandedLessonId === lesson.id ? 'Expanded' : 'Collapsed');

    console.log(`Content Preview: ${lesson.content.substring(0, 50)}...`);

    if (lesson.includeDocument) {
      // NOTE: In a production app, the attachmentFile would be a saved URL/ID, 
      // not a local File object. We use a placeholder here.
      const attachmentInfo = lesson.attachmentFile ? lesson.attachmentFile.name : 'Placeholder Attachment (Saved)';
      console.log(`Attachment Status: Document Included`);
      console.log(`[CLICK ACTION]: Simulate opening the attachment for: ${attachmentInfo}`);
    } else {
      console.log(`Attachment Status: No Document Included`);
    }
    console.log('------------------------------');
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
