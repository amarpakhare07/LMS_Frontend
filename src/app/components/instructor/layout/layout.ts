import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-layout',
  imports: [],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class InstructorLayout {
  constructor(private authService: AuthService) {}
  logout() {
    // Implement logout functionality here
    this.authService.logout();
  }
}
