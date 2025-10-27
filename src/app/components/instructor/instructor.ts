import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../dashboard-layout/dashboard-layout';
import { DashboardNavItem } from '../../models/dashboard-layout-module';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-instructor',
  standalone: true,
  imports: [CommonModule, DashboardLayout, RouterOutlet],
  templateUrl: './instructor.html',
  styleUrls: ['./instructor.css',]
})
export class InstructorLayout {
  navItems: DashboardNavItem[] = [
    { label: 'Dashboard', path: 'dashboard', icon: 'dashboard' },
    { label: 'Courses', path: 'courses', icon: 'book' },
    // { label: 'Students', path: 'students', icon: 'people' },
    { label: 'Manage Quizzes', path: 'quiz-builder', icon: 'quiz' },
    // { label: 'Enrolled Students', path: 'students', icon: 'people' },
    { label: 'Profile', path: 'profile', icon: 'account_circle' }
  ];
}
