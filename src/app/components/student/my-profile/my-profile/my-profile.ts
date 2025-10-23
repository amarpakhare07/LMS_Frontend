


import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
 import {StudentCourseService } from '../../../../services/student-course-service';
 import { UserProfile } from '../../../../models/student.model'; 
import { forkJoin, Observable, catchError, of, finalize } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar'; 

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ], 
  // Include DatePipe in providers if needed for local formatting, or rely on template pipe
  providers: [DatePipe], 
  templateUrl: './my-profile.html', 
  styleUrls: ['./my-profile.css'] 
})
export class ProfileComponent implements OnInit {
  userService = inject(StudentCourseService);
  fb = inject(FormBuilder);
  snackBar = inject(MatSnackBar); 
  datePipe = inject(DatePipe); // Inject DatePipe

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  isLoading = true;
  profile!: UserProfile;
  profileForm!: FormGroup;
  isEditMode: boolean = false;
  selectedFile: File | null = null;
  currentProfileImageUrl: string = '/assets/default-profile.png'; // Fallback
  imagePreviewUrl: string | null = null; // For local image preview before save

  // Assuming your image base URL is configured in environment
  //private imageBaseUrl: string = 'http://localhost:7049/images'; // **<-- CHANGE THIS TO YOUR ACTUAL BASE URL**
  private getImageUrl: string = 'http://localhost:7049/images';
  ngOnInit(): void {
    this.profileForm = this.fb.group({
      // Name is PERMANENTLY disabled/readonly
      name: [{ value: '', disabled: true }, Validators.required], 
      email: [{ value: '', disabled: true }], 
      bio: [{ value: '', disabled: true }, [Validators.maxLength(1000)]],
      lastLogin: [{ value: '', disabled: true }],
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.userService.getProfile().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => {
        this.profile = data;
        
        // Use the actual profile picture if available, otherwise fallback
        this.currentProfileImageUrl = data.profilePicture 
          ? `${this.getImageUrl}/${data.profilePicture}` 
          : '/assets/default-profile.png'; 

          // this.currentProfileImageUrl = `${this.getImageUrl}/${data.profilePicture}`; 

        // Reset the preview URL and selected file
        this.imagePreviewUrl = null;
        this.selectedFile = null;

        // Patch values into the form
        this.profileForm.patchValue({
          name: data.name,
          email: data.email,
          bio: data.bio || '',
          lastLogin: data.lastLogin,
        });

        // Ensure name is always disabled
        this.profileForm.get('name')?.disable();
        this.toggleFormControls();
        this.isEditMode = false;
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.snackBar.open('Failed to load profile details.', 'Close', { duration: 5000 });
      }
    });
  }

  // Helper to format last login for a beautiful display
  // formatLastLogin(date: Date | null): string {
  //   if (!date) return 'Never logged in';
  //   // Format: 'Oct 22, 2025, 9:28 PM (3 minutes ago)'
  //   return this.datePipe.transform(date, 'medium') + 
  //          ' (' + 
  //          this.datePipe.transform(date, 'shortTime') + 
  //          ' local time)';
  // }

  formatLastLogin(date: Date | null): string {
  if (!date) return 'Never logged in';

  const formattedDate = this.datePipe.transform(date, 'MMM d, y, h:mm a'); // Example: Oct 23, 2025, 2:45 PM
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  let relative = '';
  if (diffMinutes < 1) relative = 'just now';
  else if (diffMinutes < 60) relative = `${diffMinutes} min ago`;
  else if (diffMinutes < 1440) relative = `${Math.floor(diffMinutes / 60)} hrs ago`;
  else relative = `${Math.floor(diffMinutes / 1440)} days ago`;

  return `${formattedDate} (${relative})`;
}

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.toggleFormControls();

    if (!this.isEditMode) {
      this.revertFormChanges();
      this.selectedFile = null;
      this.imagePreviewUrl = null;
    }
  }

  toggleFormControls(): void {
    // Name remains disabled
    if (this.isEditMode) {
      this.profileForm.get('bio')?.enable();
    } else {
      this.profileForm.get('bio')?.disable();
    }
  }

  revertFormChanges(): void {
     this.profileForm.patchValue({
        bio: this.profile.bio || '',
     });
     this.profileForm.markAsPristine();
     this.profileForm.markAsUntouched();
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;

    if (file) {
      this.selectedFile = file;
      
      // Create a temporary URL for immediate UI preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      
      this.snackBar.open(`Image selected: ${file.name}. Click 'Save Changes' to upload.`, 'Close', { duration: 5000 });
    } else {
      this.selectedFile = null;
      this.imagePreviewUrl = null;
    }

    // FIX: Reset the input value to null so the 'change' event fires 
    // even if the user selects the same file again.
    if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
    }
  }

  isFormDirty(): boolean {
    const bioControl = this.profileForm.get('bio');
    // Check if bio control is dirty OR if a new file is selected
    return (bioControl?.dirty || this.selectedFile !== null);
  }

  onUpdateProfile(): void {
    if (!this.profileForm.valid || !this.isFormDirty()) {
      this.snackBar.open('No valid changes to save.', 'Close', { duration: 3000 });
      return;
    }

    const updates: Observable<any>[] = [];
    const bioControl = this.profileForm.get('bio');

    // 1. Prepare Bio Update Observable (only if bio is changed)
    if (bioControl?.dirty) {
      const bioUpdate$ = this.userService.updateBio({ bio: bioControl.value.trim() }).pipe(
        catchError(err => of({ error: true, message: 'Bio update failed.' }))
      );
      updates.push(bioUpdate$);
    }

    // 2. Prepare Profile Picture Update Observable (if file is selected)
    if (this.selectedFile) {
      const picUpdate$ = this.userService.uploadProfilePicture(this.selectedFile).pipe(
        catchError(err => of({ error: true, message: 'Picture update failed.' }))
      );
      updates.push(picUpdate$);
    }

    this.snackBar.open('Saving changes...', 'Close');

    // 3. Execute all updates simultaneously
    forkJoin(updates).pipe(
      finalize(() => this.toggleEditMode()) 
    ).subscribe({
      next: (results) => {
        const hasError = results.some(r => r.error);
        if (hasError) {
          this.snackBar.open('Profile saved with some errors. Check console.', 'Close', { duration: 8000 });
        } else {
          this.snackBar.open('Profile updated successfully! 🎉', 'Close', { duration: 5000 });
        }
        
        // Re-load profile to refresh UI with the new picture URL and bio
        this.loadProfile(); 
      },
      error: () => {
        this.snackBar.open('A critical network error occurred during save.', 'Close', { duration: 8000 });
      }
    });
  }
}

