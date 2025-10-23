


import { Component, OnInit } from '@angular/core';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css'],
  imports: [MatCard, MatIcon, MatCardHeader, MatCardTitle, MatCardContent, CommonModule]
})
export class DashboardComponent implements OnInit {

  popularCourses = [
    { initial: 'U', title: 'UI/UX Design', count: '30+', color: '#ffb300' }, // Amber
    { initial: 'M', title: 'Marketing', count: '25+', color: '#ef5350' },   // Red
    { initial: 'W', title: 'Web Dev.', count: '30+', color: '#66bb6a' },   // Green
    { initial: 'M', title: 'Mathematics', count: '30+', color: '#42a5f5' } // Blue
  ];

  instructors = [
    { name: 'Nil Yeager', courseCount: '5' },
    { name: 'Theron Trump', courseCount: '5' },
    { name: 'Tyler Mark', courseCount: '5' },
    { name: 'Johen Mark', courseCount: '5' }
  ];

  constructor() { }

  ngOnInit(): void { }
}