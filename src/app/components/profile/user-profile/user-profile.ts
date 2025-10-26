// user-profile.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs'; // Import Subscription to manage the stream

import { UserService } from '../../../services/user-service'
import { UserProfile } from '../../../models/interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class ProfileComponent implements OnInit {
  activeLink = 'public-profile'; // Default active link
  userName: string = '';
  photoURL: string | null = ''; // Changed to null to match the possibility of no photo
  readonly BASE_IMAGE_URL = 'https://localhost:7049/Uploads/';
  private profileSubscription!: Subscription; // To hold the subscription

  private router = inject(Router);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar); 

  ngOnInit(): void {
    // Determine active link based on current route
    this.activeLink = this.router.url.includes('/photo') ? 'photo' : 'public-profile';
    this.router.events.subscribe(() => {
        this.activeLink = this.router.url.includes('/photo') ? 'photo' : 'public-profile';
    });

    // FIX 2: Continuous subscription to profile updates.
    // This assumes userService.getUserProfile() returns an observable (e.g., BehaviorSubject)
    // that emits whenever the underlying data changes (photo, name, bio).
    this.profileSubscription = this.userService.getUserProfile().subscribe({
      next: (profile: UserProfile) => {
        this.userName = profile.name || 'User';
        this.photoURL = profile.profilePicture 
            ? this.BASE_IMAGE_URL + profile.profilePicture 
            : null; // Set to null if profilePicture is empty
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
        // Display a non-critical error for the user
        this.snackBar.open('Failed to fetch profile updates.', 'Close', { duration: 3000 });
      }
    });
  }

  getUserInitial(): string {
		const name = this.userName?.trim();
		if (name && name.length > 0) {
			return name.charAt(0).toUpperCase();
		}
		return 'U'; // Default initial if name is empty
	}

  
  // Good practice to unsubscribe to prevent memory leaks
  ngOnDestroy(): void {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  // goBackToDashboard(): void {
  //   this.router.navigate(['/dashboard']);
  // }
}


