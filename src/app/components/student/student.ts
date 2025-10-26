import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../dashboard-layout/dashboard-layout';
import { DashboardNavItem } from '../../models/dashboard-layout-module';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, DashboardLayout, RouterOutlet],
  templateUrl: './student.html'
})
export class StudentLayout {
  navItems: DashboardNavItem[] = [
    { label: 'Dashboard', path: 'dashboard', icon: 'dashboard' },
    { label: 'My Courses', path: 'my-courses', icon: 'book' },
    { label: 'Quizzes', path: 'quizzes', icon: 'quiz' },
    { label: 'Profile', path: 'profile', icon: 'account_circle' }
  ];
}