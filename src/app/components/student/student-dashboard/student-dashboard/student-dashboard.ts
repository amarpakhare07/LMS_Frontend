


import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StudentCourseService } from '../../../../services/student-course-service';
import { 
    SummaryCard, 
    CourseAvgScore, 
    TopInstructorDto, 
    StudentDashboardData 
} from '../../../../models/student.model';
// ❌ REMOVE Chart.js imports (Chart, registerables, ChartData)
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { StudentWidgetComponent } from '../../../widget/student-widget/student-widget';
import { UserService } from '../../../../services/user-service';
import { TopInstructorsComponent } from "../../top-instructor/top-instructor";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"; 

// 🟢 NEW: ApexCharts Imports
import { 
    NgApexchartsModule, 
    ApexAxisChartSeries, 
    ApexChart, 
    ApexXAxis, 
    ApexTitleSubtitle, 
    ApexYAxis,
    ApexFill,
    ApexDataLabels,
    ApexTooltip
} from "ng-apexcharts";


// 🟢 NEW: Define ApexCharts Options Interface
export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis | ApexYAxis[];
    title: ApexTitleSubtitle;
    fill: ApexFill;
    colors: string[];
    dataLabels: ApexDataLabels;
    tooltip: ApexTooltip;
};


@Component({
    selector: 'app-student-dashboard',
    standalone: true,
    // 🟢 ADD NgApexchartsModule
    imports: [CommonModule, MatIconModule, StudentWidgetComponent, FormsModule, TopInstructorsComponent, MatProgressSpinnerModule, NgApexchartsModule],
    templateUrl: './student-dashboard.html',
    styleUrl: './student-dashboard.css',
})
// ❌ REMOVE AfterViewInit
export class StudentDashboardComponent implements OnInit, OnDestroy { 
    userName: string = '';
    
    // Dependencies
    private studentCourseService = inject(StudentCourseService);
    private userService = inject(UserService);

    // Data Properties
    public summaryCards: SummaryCard[] = [];
    public isLoading: boolean = true;
    public topInstructors: TopInstructorDto[] = [];

    // ❌ REMOVE: Chart.js/Ngx-Charts properties (overviewChartData, overviewChartInstance, viewInitialized, CHART_COLORS, CHART_BORDER_COLORS)
    
    // 🟢 NEW: ApexCharts property
    public chartOptions: Partial<ChartOptions> | undefined; 
    
    // Define a modern color palette for the bars (from the solution)
    private APEX_COLORS: string[] = ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc948'];

    
    ngOnInit(): void {
        this.fetchDashboardSummary(); 
        
        this.userService.getUserProfile().subscribe({
            next: (profile) => {
                this.userName = profile.name?.split(' ')[0] || 'User';
            }
        });
    }

    // ❌ REMOVE ngAfterViewInit

    /**
     * Fetches the summary data from the backend service and populates all dashboard sections.
     */
    private fetchDashboardSummary(): void {
        this.isLoading = true;
        this.studentCourseService.getDashboardSummary()
            .pipe(finalize(() => {
                this.isLoading = false;
                // ❌ REMOVE Chart.js rendering logic (setTimeout(0), renderCharts call)
            }))
            .subscribe({
                next: (dto: StudentDashboardData) => {
                    this.summaryCards = this.transformToSummaryCards(dto);
                    // The chart setup is called here
                    this.setupQuizScoreChartData(dto.courseAverageScores || []); 
                    this.topInstructors = dto.topInstructors || [];
                },
                error: (err) => {
                    console.error('Error fetching student dashboard summary:', err);
                    this.summaryCards = this.getFallbackSummaryCards();
                    this.topInstructors = []; 
                    // 🟢 Set new property to undefined on error
                    this.chartOptions = undefined;
                }
            });
    }
    
    // --- Data Transformation Methods (Unchanged) ---
    private transformToSummaryCards(dto: StudentDashboardData): SummaryCard[] {
        const enrolled = dto.enrolledCoursesCount ?? 0;
        const completed = dto.completedCoursesCount ?? 0;
        const uniqueQuiz = dto.uniqueQuizzesAttempted ?? 0;
        const activeCourses = enrolled - completed;
        
        const overallAvgScore = this.calculateOverallAvgScore(dto.courseAverageScores || []);

        return [
            { title: 'Total Courses', value: enrolled, iconName: 'all_inclusive', colorClass: 'green', trend: 'View History' },
            { title: 'Active Courses', value: activeCourses < 0 ? 0 : activeCourses, iconName: 'school', colorClass: 'blue', trend: 'View Details' },
            { 
                title: 'Quizzes Taken', 
                value: uniqueQuiz, 
                iconName: 'done_all',
                colorClass: 'cyan', 
                trend: 'Unique Quizzes' 
            },
            {
                title: 'Overall Avg. Score',
                value: overallAvgScore,
                iconName: 'bar_chart',
                colorClass: 'orange',
                trend: 'Performance'
            }
        ];
    }
    
    private calculateOverallAvgScore(scores: CourseAvgScore[]): string {
        if (!scores || scores.length === 0) return 'N/A';
        
        const validScores = scores
            .map(s => s.averageScore)
            .filter((score): score is number => score !== null && score !== undefined);

        if (validScores.length === 0) return 'N/A';

        const overallAvg = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
        return `${Math.round(overallAvg)}%`;
    }

    private getFallbackSummaryCards(): SummaryCard[] {
        return [
            { title: 'Total Courses', value: 0, iconName: 'all_inclusive', colorClass: 'green', trend: 'N/A' },
            { title: 'Active Courses', value: 0, iconName: 'school', colorClass: 'blue', trend: 'N/A' },
            { 
                title: 'Quizzes Taken', 
                value: 0, 
                iconName: 'done_all',
                colorClass: 'cyan', 
                trend: 'Unique Quizzes' 
            },
            {
                title: 'Overall Avg. Score',
                value: 'N/A',
                iconName: 'bar_chart',
                colorClass: 'orange',
                trend: 'Performance'
            }
        ];
    }
    
    /**
     * Transforms CourseAvgScore data into the ApexCharts Bar Chart format.
     */
    private setupQuizScoreChartData(scores: CourseAvgScore[]): void {
        if (!scores || scores.length === 0) {
            this.chartOptions = undefined;
            return;
        }

        const dataValues = scores.map(s => s.averageScore || 0);
        const categories = scores.map(s => s.courseName);
        
        // 🟢 Configure the ApexCharts options object
        this.chartOptions = {
            series: [{
                name: 'Average Score',
                data: dataValues
            }],
            chart: {
                type: 'bar',
                height: 350,
                toolbar: { show: false }
            },
            title: {
                text: 'Course vs Average Quiz Score Comparison',
                align: 'left'
            },
            xaxis: {
                categories: categories,
                title: {
                    text: 'Course'
                }
            },
            yaxis: {
                title: {
                    text: 'Average Quiz Score (%)'
                },
                min: 0,
                max: 100,
                labels: {
                    formatter: function (val: number) {
                        return val.toFixed(0) + "%";
                    }
                }
            },
            // Use different colors for each bar
            colors: this.APEX_COLORS.slice(0, scores.length),
            fill: {
                opacity: 0.9,
                colors: this.APEX_COLORS.slice(0, scores.length)
            },
            dataLabels: {
                enabled: true,
                formatter: function(val: number | string) {
                    return val + "%";
                },
                style: {
                    colors: ['#343a40'] // Dark color for contrast
                }
            },
            tooltip: {
                y: {
                    formatter: function (val: number) {
                        return val + "%";
                    }
                }
            }
        };
    }

    // ❌ REMOVE renderCharts
    
    // ❌ REMOVE Chart.js destroy logic (ApexCharts handles cleanup)
    ngOnDestroy(): void {}
}