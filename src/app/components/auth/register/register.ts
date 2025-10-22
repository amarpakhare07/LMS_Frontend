// src/app/components/register/register.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

// --- NEW MATERIAL IMPORTS ---
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
// --- END NEW IMPORTS ---

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,

    // --- ADDED MODULES ---
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
    // --- END ADDED MODULES ---
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  errorMessage: string | null = null;
  
  // For the password visibility toggle
  hidePassword = true;

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value as any).subscribe({
        error: (err) => {
          this.errorMessage = 'Registration failed. The email might already be in use.';
        }
      });
    }
  }

  // Helper method for the password toggle
  togglePassword(event: MouseEvent): void {
    event.preventDefault(); // Prevent form submission
    this.hidePassword = !this.hidePassword;
  }
}