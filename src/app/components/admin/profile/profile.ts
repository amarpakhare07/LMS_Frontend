import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { User } from '../../../models/interfaces';


// Optional: abstract service you can implement
export interface UserProfileService {
  getMe(): Promise<User>;
  updateProfile(payload: { name: string; bio: string | null; profilePicture?: File | null }): Promise<User>;
  deactivate(): Promise<void>;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private sanitizer = inject(DomSanitizer);

  // If you want to pass the user in from a parent, keep @Input() available
  @Input() user: User  | null = null;

  // Local state
  isLoading = signal(true);
  isEditing = signal(false);
  isSaving = signal(false);
  errorMsg = signal<string | null>(null);

  // Form
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: [{ value: '', disabled: true }],
    bio: [''],
  });

  // Profile picture
  previewUrl = signal<SafeUrl | null>(null);
  fileToUpload: File | null = null;

  // Display helpers
  readonly roleLabel = computed(() => {
    const u = this.user;
    if (!u) return '';
    switch (u.role) {
      case 3: return 'Admin';
      case 2: return 'Instructor';
      default: return 'Student';
    }
  });

  readonly statusLabel = computed(() => this.user?.isActive ? 'Active' : 'Inactive');

  async ngOnInit() {
    try {
      this.isLoading.set(true);
      if (!this.user) {
        // If not provided via @Input, you can fetch from your auth/me endpoint
        // Replace with your real implementation
        // const me = await this.userService.getMe();
        // this.user = me;

        // TEMP: Throw if user not injected to encourage wiring
        throw new Error('User input not provided. Pass [user] or wire getMe() service.');
      }

      this.patchForm(this.user);
      this.setPreviewFromUrl(this.user.profilePicture || null);
    } catch (err: any) {
      console.error(err);
      this.errorMsg.set(err?.message || 'Failed to load profile.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private patchForm(u: User) {
    this.form.reset({
      name: u.name || '',
      email: u.email || '',
      bio: u.bio || ''
    });
    this.form.markAsPristine();
  }

  toggleEdit() {
    this.isEditing.set(!this.isEditing());
    // Reset on cancel
    if (!this.isEditing()) {
      if (this.user) {
        this.patchForm(this.user);
        this.setPreviewFromUrl(this.user.profilePicture || null);
        this.fileToUpload = null;
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.fileToUpload = file;

    if (!file) {
      // Restore to existing
      this.setPreviewFromUrl(this.user?.profilePicture || null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.previewUrl.set(this.sanitizer.bypassSecurityTrustUrl(result));
    };
    reader.readAsDataURL(file);
  }

  private setPreviewFromUrl(url: string | null) {
    if (!url) {
      this.previewUrl.set(null);
      return;
    }
    this.previewUrl.set(url as unknown as SafeUrl);
  }

  async onSave() {
    if (!this.user) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, bio } = this.form.getRawValue();
    const payload = {
      name: name!.trim(),
      bio: (bio || '').trim() || null,
      profilePicture: this.fileToUpload
    };

    try {
      this.isSaving.set(true);
      // Replace with your real API call
      // const updated = await this.userService.updateProfile(payload);
      // Simulate optimistic update locally:
      const updated: User = {
        ...this.user,
        name: payload.name,
        bio: payload.bio,
        profilePicture: this.fileToUpload ? 'blob-preview' : this.user.profilePicture,
        updatedAt: new Date().toISOString()
      };

      this.user = updated;
      this.patchForm(updated);
      if (this.fileToUpload) {
        // keep preview; real API should return hosted URL
      }
      this.snack.open('Profile updated', 'Close', { duration: 2000 });
      this.isEditing.set(false);
      this.fileToUpload = null;
    } catch (err: any) {
      console.error(err);
      this.snack.open(err?.message || 'Update failed. Please try again.', 'Close', { duration: 3000 });
    } finally {
      this.isSaving.set(false);
    }
  }

  // Optional: deactivate (soft)
  async onDeactivate() {
    try {
      // await this.userService.deactivate();
      this.snack.open('Account deactivated', 'Close', { duration: 2500 });
    } catch (err: any) {
      console.error(err);
      this.snack.open('Failed to deactivate account', 'Close', { duration: 2500 });
    }
  }

  trackByNothing = (_: number) => 0;
}