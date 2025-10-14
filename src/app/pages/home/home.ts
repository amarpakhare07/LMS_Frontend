// src/app/components/dashboard/dashboard.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Welcome to the Home!</h1>
    <p>This page is protected. You can only see it if you are logged in.</p>
    <button (click)="logout()">Logout</button>
  `
})
export class Home {
  private authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}