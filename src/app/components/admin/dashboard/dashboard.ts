import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardSummary, User } from '../../../models/interfaces';
import { AdminService } from '../../../services/admin-service';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule,BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class AdminDashboard implements OnInit {
  users: User[] = [];
  summary: DashboardSummary | null = null;
  isLoading = true;
  error: string | null = null;

  // ## Chart Properties ##
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  };
  public pieChartLegend = true;

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Active Users', 'Inactive Users'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#28a745', '#dc3545'], // Green for Active, Red for Inactive
      },
    ],
  };
  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.adminService.fetchDashboardData().subscribe({
      next: ({ students, instructors, admins }) => {
        // --- All calculations happen here, after data arrives ---

        // 1. Combine all users into a single array for the table and active count
        const allUsers = [...students, ...instructors, ...admins];

        // 2. Calculate the summary stats using the lengths of the fetched arrays
        this.summary = {
          totalUsers: allUsers.length,
          activeUsers: allUsers.filter((u) => u.isActive).length,
          roles: {
            Student: students.length,
            Instructor: instructors.length,
            Admin: admins.length,
          },
        };

        // 3. Set the combined user list for the table
        this.users = allUsers;
        this.pieChartData = {
          labels: ['Students', 'Instructors', 'Admins'],
          datasets: [
            {
              data: [students.length, instructors.length, admins.length],
              backgroundColor: [
                '#36A2EB', // Blue for Students
                '#FFCE56', // Yellow for Instructors
                '#FF6384', // Red for Admins
              ],
              hoverBackgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
            },
          ],
        };
        this.doughnutChartData.datasets[0].data = [
          this.summary.activeUsers,
          this.summary.totalUsers - this.summary.activeUsers,
        ];
        this.isLoading = false;
      },

      error: (err) => {
        this.error = 'Failed to fetch dashboard data.';
        this.isLoading = false;
        console.error(err);
      },
    });
  }
}
import { ChartData, ChartOptions } from 'chart.js';
