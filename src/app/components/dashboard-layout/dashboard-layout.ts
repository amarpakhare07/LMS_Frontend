import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { DashboardNavItem } from '../../models/dashboard-layout-module';

// Angular Material Imports
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';


// Assuming AuthService is available
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive,
    // Material Modules
    MatSidenavModule, MatListModule, MatIconModule, MatToolbarModule, MatButtonModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {
  @Input() title: string = 'Dashboard';
  @Input() navItems: DashboardNavItem[] = [];

  // Use a signal for responsive state control
  protected isSidebarOpen = signal(true);
  private authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    // We use the injected router for a clean Angular navigation
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Toggle the sidebar (mainly for smaller screens)
  toggleSidebar() {
    this.isSidebarOpen.update((val) => !val);
    
  }
}
