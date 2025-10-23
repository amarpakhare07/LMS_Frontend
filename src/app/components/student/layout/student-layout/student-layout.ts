// src/app/components/student/layout/student-layout.ts
import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../services/auth-service';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

// --- MATERIAL IMPORTS ---
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
// --- END MATERIAL IMPORTS ---

@Component({
  selector: 'app-student-layout', // Updated selector
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
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
  templateUrl: './student-layout.html', // Updated template file
  styleUrls: ['./student-layout.css'],   // Updated style file
})
export class StudentLayout { // Updated class name
  authService = inject(AuthService);
  
  private breakpointObserver = inject(BreakpointObserver);

  // Create an observable that emits true/false if the screen is "Handset" (mobile)
  isMobile$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  // Logout method remains the same
  logout(): void {
    this.authService.logout();
  }
}