// src/app/components/admin/layout/layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Import AsyncPipe
import { RouterOutlet } from '@angular/router';

// --- NEW MATERIAL IMPORTS ---
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { DashboardNavItem } from '../../../models/dashboard-layout-module';
import { DashboardLayout } from "../../dashboard-layout/dashboard-layout";
// --- END NEW IMPORTS ---

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, // <-- Add CommonModule
    RouterOutlet,
    // --- ADDED MODULES ---
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    DashboardLayout
],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
})
export class AdminLayout {


  navItems: DashboardNavItem[] = [
      { label: 'Dashboard', path: 'dashboard', icon: 'dashboard' },
      { label: 'Manage Users', path: 'users', icon: 'person' },
      { label: 'Manage Courses', path: 'courses', icon: 'book' },
      { label: 'Profile', path: 'profile', icon: 'account_circle' }
    ];
}