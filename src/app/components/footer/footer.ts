// src/app/components/footer/footer.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // <-- Import RouterLink
import { DomSanitizer } from '@angular/platform-browser'; // <-- Import DomSanitizer

// --- NEW MATERIAL IMPORTS ---
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { AuthService } from '../../services/auth-service';
// --- END NEW IMPORTS ---

// --- SVG icon strings for social media ---
const TWITTER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.28C8.28,9.09 5.11,7.38 2.92,4.77C2.55,5.37 2.36,6.09 2.36,6.87C2.36,8.47 3.17,9.89 4.37,10.72C3.64,10.7 2.96,10.5 2.38,10.18L2.38,10.23C2.38,12.41 3.94,14.19 5.92,14.6C5.55,14.7 5.17,14.75 4.77,14.75C4.5,14.75 4.24,14.72 3.98,14.67C4.54,16.46 6.1,17.74 7.9,17.78C6.35,18.98 4.4,19.67 2.3,19.67C1.97,19.67 1.64,19.65 1.32,19.61C3.12,20.82 5.25,21.5 7.55,21.5C16.04,21.5 20.45,14.51 20.45,8.79C20.45,8.6 20.45,8.42 20.44,8.23C21.32,7.6 22,6.85 22.46,6Z"/></svg>`;
const FACEBOOK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17,2V2H17V6H15C14.31,6 14,6.81 14,7.5V10H17L16,14H14V22H10V14H7V10H10V6.5C10,3.5 11.5,2 15,2Z"/></svg>`;
const LINKEDIN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19M18.5,18.5V13.2A3.26,3.26 0 0,0 15.24,9.94C14.39,9.94 13.4,10.43 13,11.1V10.13H10V18.5H13V13.57C13,12.8 13.09,12.05 14.24,12.05C15.39,12.05 15.5,12.92 15.5,13.66V18.5H18.5M6.5,18.5H9.5V10.13H6.5V18.5M8,8.47C7.43,8.47 7,7.9 7,7.29C7,6.68 7.43,6.11 8,6.11S9,6.68 9,7.29C9,7.9 8.57,8.47 8,8.47Z"/></svg>`;


@Component({
  selector: 'app-footer',
  imports: [
    CommonModule,
    RouterLink, // <-- Add RouterLink
    // --- ADDED MODULES ---
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  standalone: true,
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  private authService = inject(AuthService);
  userRole$: string | null;

  // --- NEW: Register the custom SVG icons ---
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIconLiteral('twitter', sanitizer.bypassSecurityTrustHtml(TWITTER_ICON));
    iconRegistry.addSvgIconLiteral('facebook', sanitizer.bypassSecurityTrustHtml(FACEBOOK_ICON));
    iconRegistry.addSvgIconLiteral('linkedin', sanitizer.bypassSecurityTrustHtml(LINKEDIN_ICON));
    this.userRole$ = this.authService.getUserRole();
  }
}