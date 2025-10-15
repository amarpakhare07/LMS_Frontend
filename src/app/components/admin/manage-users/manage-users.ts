// src/app/components/admin/manage-users/manage-users.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✨ Import FormsModule for ngModel
import { User } from '../../../models/interfaces';
import { AdminService } from '../../../services/admin-service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✨ Add FormsModule here
  templateUrl: './manage-users.html', // We'll move the template to its own file
  styleUrls: ['./manage-users.css'] // We'll move styles to their own file
})
export class ManageUsers implements OnInit {
  adminService = inject(AdminService);
  
  isLoading = true;
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  
  // Properties for filtering
  searchTerm: string = '';
  statusFilter: string = 'all'; // 'all', 'active', 'inactive'

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.allUsers = data;
        this.applyFilters(); // Apply initial filters
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let users = [...this.allUsers];

    // 1. Filter by status
    if (this.statusFilter !== 'all') {
      const isActive = this.statusFilter === 'active';
      users = users.filter(user => user.isActive === isActive);
    }

    // 2. Filter by search term
    if (this.searchTerm) {
      const lowercasedTerm = this.searchTerm.toLowerCase();
      users = users.filter(user =>
        user.name.toLowerCase().includes(lowercasedTerm) ||
        user.email.toLowerCase().includes(lowercasedTerm)
      );
    }
    
    this.filteredUsers = users;
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'Deactivate' : 'Activate';
    const confirmation = confirm(`Are you sure you want to ${action} the user "${user.name}"?`);

    if (confirmation) {
      const newStatus = !user.isActive;
      this.adminService.updateUserStatus(user.email, newStatus).subscribe({
        next: () => {
          // Update the status in both the master and filtered lists
          const userInAll = this.allUsers.find(u => u.email === user.email);
          if (userInAll) userInAll.isActive = newStatus;
          this.applyFilters(); // Re-apply filters to update the view
        },
        error: (err) => console.error('Failed to update user status', err)
      });
    }
  }
}