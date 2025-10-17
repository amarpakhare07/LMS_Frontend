import { Component, Input } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface DashboardNavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule ,RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.css']
})
export class DashboardLayout {
  @Input() title: string = 'Dashboard';
  @Input() navItems: DashboardNavItem[] = [];
  @Input() showLogout: boolean = true;

  logout(): void {
    localStorage.removeItem('auth_token');
    location.href = '/login'; // or use Router if injected
  }
}
