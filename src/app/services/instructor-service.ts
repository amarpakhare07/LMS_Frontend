import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs'; 
import { map } from 'rxjs/operators';

import { InstructorProfileApi} from '../models/instructor-dashboard'; 
import { environment } from '../../environment'; 
import { RawDashboardData } from '../models/instructor-dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; 

  /**
   * Fetches the instructor's name and analytics data, returning raw numbers and string values.
   */
  getDashboardData(): Observable<RawDashboardData> {
    // 1. Fetch User Profile (for Name)
    const user$ = this.http.get<InstructorProfileApi>(`${this.apiUrl}/UserManagement/me`);
    
    // 2. Fetch Real Analytics (for Students, Courses, and Videos)
    const analytics$ = this.http.get<any>(`${this.apiUrl}/UserManagement/instructor/analytics`);

    // 3. Mock Metrics (for Earnings)
    // We mock this simple string/value here and combine it later
    const totalEarning$ = of('$8,015.30'); 

    // Combine all three observables.
    return forkJoin({ user: user$, analytics: analytics$, totalEarning: totalEarning$ }).pipe(
      map(results => {
        
        // The service now returns a simple object containing only data points.
        return {
            instructorName: results.user.name || 'Instructor', 
            totalStudents: results.analytics.totalStudents,
            totalCourses: results.analytics.totalCourses,
            totalVideos: results.analytics.totalVideos,
            totalEarning: results.totalEarning // Mocked
        };
      })
    );
  }
}
