// src/app/components/login/login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { RouterLink } from '@angular/router';

// --- NEW MATERIAL IMPORTS ---
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
// --- END NEW IMPORTS ---


@Component({
  selector: 'app-login',
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
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  errorMessage: string | null = null;
  
  // For the password visibility toggle
  hidePassword = true;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value as any).subscribe({
        error: (err) => this.errorMessage = 'Login failed. Please check your credentials. | Deactivated User'
      });
    }
  }

  // Helper method for the password toggle
  togglePassword(event: MouseEvent): void {
    event.preventDefault(); // Prevent form submission
    this.hidePassword = !this.hidePassword;
  }
}