import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http'; 

import { Course } from '../../../models/instructor-dashboard';
import { WidgetComponent } from '../../widget/widget';
// 🚨 Import RawDashboardData interface for type safety
import { RawDashboardData } from '../../../models/instructor-dashboard'; 
// 🚨 Import SummaryCard model as we are now building this array here
import { SummaryCard } from '../../../models/widget-module'; 
import { DashboardService } from '../../../services/instructor-service';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true, 
  imports: [
    CommonModule, 
    WidgetComponent,
    MatIconModule, 
    MatButtonModule,
    HttpClientModule
  ],
  // Assuming the template and styles paths are correct
  templateUrl: './instructor-dashboard.html',
  styleUrls: ['./instructor-dashboard.css']
})
export class InstructorDashboardComponent implements OnInit {

  instructorName: string = 'Loading...'; 
  // summaryCards is still the output, but it's populated locally
  summaryCards: SummaryCard[] = []; 
  isLoading: boolean = true; 
  // topCourses array is commented out as requested

  constructor(private dashboardService: DashboardService) { } 

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    // 🚨 Service now returns RawDashboardData, not SummaryCard[]
    this.dashboardService.getDashboardData().subscribe({
      next: (data: RawDashboardData) => {
        this.instructorName = data.instructorName; 
        
        // 🚨 Call the new mapping function here 🚨
        this.summaryCards = this.mapRawMetricsToCards(data); 
        
        this.isLoading = false;
        console.log('API Name Received:', this.instructorName); 
      },
      error: (err) => {
        console.error('Error fetching dashboard data:', err);
        this.instructorName = 'Instructor'; 
        this.isLoading = false;
      }
    });
  }
  
  /**
   * 🚨 NEW METHOD: Maps raw backend numbers to formatted SummaryCard objects.
   * This centralizes all presentation logic (titles, icons, colors, trends).
   */
  private mapRawMetricsToCards(metrics: RawDashboardData): SummaryCard[] {
      return [
        {
            title: 'Total Students',
            value: `${metrics.totalStudents}`, 
            trend: '+12.04%', // 🚨 Hardcoded presentation detail
            iconName: 'person', 
            colorClass: 'blue' // 🚨 Hardcoded presentation detail
        },
        {
            title: 'Total Course',
            value: `${metrics.totalCourses}`, 
            trend: '-12.11%', // 🚨 Hardcoded presentation detail
            iconName: 'book', 
            colorClass: 'green' // 🚨 Hardcoded presentation detail
        },
        {
            title: 'Total Video',
            value: `${metrics.totalVideos}`, 
            trend: '+25.21%', // 🚨 Hardcoded presentation detail
            iconName: 'videocam', 
            colorClass: 'cyan' // 🚨 Hardcoded presentation detail
        },
        { 
            title: 'Total Earning', 
            value: metrics.totalEarning, 
            trend: '+25.21%', // 🚨 Hardcoded presentation detail
            iconName: 'payments', 
            colorClass: 'orange' // 🚨 Hardcoded presentation detail
        }
      ];
  }
}
