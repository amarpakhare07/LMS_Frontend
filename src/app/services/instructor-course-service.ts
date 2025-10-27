import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Course } from '../components/instructor/instructor-courses/instructor-courses'; 
import { CourseListDto } from '../models/course.model';
import { environment } from '../../environment'; 

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; 

  private mapDtoToDisplayCourse(dto: CourseListDto, instructorName: string = 'John Debi'): Course {
    let status: Course['status'];
    
    if (dto.published === true) {
      status = 'Published';
    } else {
      status = 'Unlisted'; 
    }

    return {
      name: dto.title,
      instructor: instructorName, 
      lessons: dto.totalLessons,
      totalTime: dto.totalDurationDisplay,
      status: status,
      category: dto.courseCategory
    }
  }

  getInstructorCourses(): Observable<Course[]> {
    const fullUrl = `${this.apiUrl}/UserManagement/instructor/courses`;

    return this.http.get<CourseListDto[]>(fullUrl).pipe(
      map(dtos => dtos.map(dto => this.mapDtoToDisplayCourse(dto)))
    );
  }
}