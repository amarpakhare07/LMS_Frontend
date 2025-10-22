// src/app/components/admin/layout/layout.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common'; // <-- Import AsyncPipe
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { Observable } from 'rxjs'; // <-- Import Observable
import { map, shareReplay } from 'rxjs/operators'; // <-- Import RxJs operators
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'; // <-- Import BreakpointObserver

// --- NEW MATERIAL IMPORTS ---
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
// --- END NEW IMPORTS ---

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, // <-- Add CommonModule
    AsyncPipe,    // <-- Add AsyncPipe
    RouterOutlet,
    RouterLink,
    RouterLinkActive,

    // --- ADDED MODULES ---
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
})
export class AdminLayout {
  authService = inject(AuthService);
  
  // --- NEW RESPONSIVE LOGIC ---
  private breakpointObserver = inject(BreakpointObserver);

  // Create an observable that emits true/false if the screen is "Handset" (mobile)
  isMobile$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  // --- END NEW LOGIC ---

  logout() {
    this.authService.logout();
  }
}