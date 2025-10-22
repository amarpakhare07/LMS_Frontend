import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import Material Icons and Button Module
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button'; 

import { SummaryCard, Course } from '../../../models/widget-module'; 
import { WidgetComponent } from '../../widget/widget';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true, 
  imports: [
    CommonModule, 
    WidgetComponent,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './instructor-dashboard.html',
  styleUrls: ['./instructor-dashboard.css']
})
export class InstructorDashboardComponent implements OnInit {

  summaryCards: SummaryCard[] = [
    {
      title: 'Total Students',
      value: '150+',
      trend: '+12.04%',
      iconName: 'person', 
      colorClass: 'blue'
    },
    {
      title: 'Total Course',
      value: '20+',
      trend: '-12.11%',
      iconName: 'menu_book',
      colorClass: 'green'
    },
    {
      title: 'Total Video',
      value: '25+',
      trend: '+25.21%',
      iconName: 'videocam',
      colorClass: 'cyan'
    },
    {
      title: 'Total Earning',
      value: '$8,015.30',
      trend: '+25.21%',
      iconName: 'payment',
      colorClass: 'orange'
    }
  ];

  topCourses: Course[] = [
    { name: 'Machine Learning', instructor: 'John Debi', lessons: 32, totalTime: '248 Hr', status: 'Published' },
    { name: 'Techniques for Reduction', instructor: 'John Debi', lessons: 24, totalTime: '248 Hr', status: 'Published' },
    { name: 'User Interface Design', instructor: 'John Debi', lessons: 25, totalTime: '248 Hr', status: 'Push' },
    { name: 'Digital Marketing', instructor: 'John Debi', lessons: 30, totalTime: '248 Hr', status: 'Published' },
    { name: 'Python Programming', instructor: 'John Debi', lessons: 25, totalTime: '248 Hr', status: 'Upcoming' }
  ];

  constructor() { }

  ngOnInit(): void { }

  getStatusClass(status: Course['status']): string {
    switch (status) {
      case 'Published':
        return 'status-published';
      case 'Upcoming':
        return 'status-upcoming';
      case 'Push':
        return 'status-push'; 
      default:
        return 'status-default';
    }
  }

  viewCourse(course: Course): void { console.log('Viewing course:', course.name); }
  editCourse(course: Course): void { console.log('Editing course:', course.name); }
  deleteCourse(course: Course): void { console.log('Deleting course:', course.name); }
}