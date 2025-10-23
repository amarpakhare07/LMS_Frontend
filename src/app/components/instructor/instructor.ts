import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { DashboardLayout, DashboardNavItem } from '../dashboard-layout/dashboard-layout';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-instructor',
  standalone: true,
  //imports: [CommonModule, DashboardLayout, RouterOutlet],
  templateUrl: './instructor.html',
  styleUrls: ['./instructor.css',]
})
export class InstructorLayout {
  // //navItems: DashboardNavItem[] = [
  //   { label: 'Dashboard', path: 'dashboard' },
  //   { label: 'Courses', path: 'courses' },
  //   { label: 'Students', path: 'students' },
  //   { label: 'Profile', path: 'profile' }
  // ];
}