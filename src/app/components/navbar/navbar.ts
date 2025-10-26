import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { AuthService, DecodedToken } from '../../services/auth-service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class Navbar implements OnInit {
  private authService = inject(AuthService);
    private userService = inject(UserService);
  
  imagePreviewUrl: string | ArrayBuffer | null = null;

  ngOnInit(): void {
    this.userService.getUserPhoto().subscribe((image) => {
      this.imagePreviewUrl = image.photoURL;
    });
  }

  isLoggedIn$: Observable<boolean>;
  currentUser$: Observable<DecodedToken | null>;
  userRole$: string | null;

  constructor() {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.currentUser$ = this.authService.currentUser$;
    this.userRole$ = this.authService.getUserRole();
  }

  logout(): void {
    this.authService.logout();
  }
}