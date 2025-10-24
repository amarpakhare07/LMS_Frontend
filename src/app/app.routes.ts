import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { authGuard } from './services/auth-guard';
import { Register } from './components/auth/register/register';
import { ManageCourses } from './components/admin/manage-courses/manage-courses';
import { ManageUsers } from './components/admin/manage-users/manage-users';
import { Profile } from './components/admin/profile/profile';
import { RegisterInstructor } from './components/auth/register-instructor/register-instructor';
import { AdminDashboard } from './components/admin/dashboard/dashboard';
import { AdminLayout } from './components/admin/layout/layout';
import { HomeComponent } from './components/home/home';
import { InstructorLayout } from './components/instructor/instructor';
import { Unauthorized } from './components/unauthorized/unauthorized';
import { InstructorDashboardComponent } from './components/instructor/instructor-dashboard/instructor-dashboard';
import { CourseDetailComponent } from './components/course/course-detail/course-detail';
import { enrolledGuard } from './services/enrolled-guard';
import { CourseLearn } from './components/course/course-learn/course-learn';
import { publicGuard } from './services/public-guard';
import { InstructorCoursesComponent } from './components/instructor/instructor-courses/instructor-courses';
import { InstructorCreateCourseComponent } from './components/instructor/instructor-createcourse/instructor-createcourse';


import { StudentLayout } from './components/student/layout/student-layout/student-layout';
import { DashboardComponent } from './components/student/dashboard/student-dashboard/student-dashboard';
import { MyCoursesComponent } from './components/student/my-courses/student-my-courses/student-my-courses';
import { ProfileComponent } from './components/student/my-profile/my-profile/my-profile';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'register', component: Register, canActivate: [publicGuard] },
  { path: 'register-instructor', component: RegisterInstructor, canActivate: [publicGuard] },
  {
    path: 'home',
    component: HomeComponent,
    // canActivate: [authGuard], // Apply the guard here
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard], // Apply the same guard
    data: {
      expectedRole: 'Admin', // ✨ Add the required role here
    },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default admin route
      { path: 'dashboard', component: AdminDashboard },
      { path: 'users', component: ManageUsers },
      { path: 'courses', component: ManageCourses },
      { path: 'profile', component: Profile },
    ],
  },
  {
  path: 'instructor',
  component: InstructorLayout,
  canActivate: [authGuard],
  data: { expectedRole: 'Instructor' },
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: InstructorDashboardComponent },
    { path: 'courses', component: InstructorCoursesComponent },
    { path: 'create-course', component: InstructorCreateCourseComponent },
    // { path: 'profile', component: Profile }
  ]
  },

  { 
    path: 'course/:id', 
    component: CourseDetailComponent,
  },
  {
    path: 'course/:id/learn',
    component: CourseLearn,
    canActivate: [authGuard, enrolledGuard]
  },
  {
    path: 'student',
    component: StudentLayout,
    canActivate: [authGuard], // Protect the route
    data: {
      expectedRole: 'Student', // For role-based access control
    },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'my-courses', component: MyCoursesComponent },
      { path: 'profile', component: ProfileComponent },
    ]
  },
  // Redirect to home by default if logged in, otherwise guard will redirect to login
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Wildcard route for 404
  { path: '**', redirectTo: '/unauthorized' },
];
