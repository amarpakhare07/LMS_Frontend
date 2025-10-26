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
import { Unauthorized } from './components/shared/unauthorized/unauthorized';
import { InstructorDashboardComponent } from './components/instructor/instructor-dashboard/instructor-dashboard';
import { CourseDetailComponent } from './components/course/course-detail/course-detail';
import { enrolledGuard } from './services/enrolled-guard';
import { CourseLearn } from './components/course/course-learn/course-learn';
import { publicGuard } from './services/public-guard';


import { StudentLayout } from './components/student/student';
import {  StudentDashboardComponent as DashboardComponent } from './components/student/student-dashboard/student-dashboard/student-dashboard';
import { MyCoursesComponent } from './components/student/my-courses/student-my-courses/student-my-courses';


//import { StudentDashboardComponent } from './components/student/student-dashboard/student-dashboard/student-dashboard';
import { ProfileComponent } from './components/profile/user-profile/user-profile';
import { PublicProfileComponent } from './components/profile/public-profile/public-profile';
import { PhotoProfileComponent } from './components/profile/photo-profile/photo-profile';
import { QuizSummaryComponent } from './components/student/quiz-summary/quiz-summary';
export const routes: Routes = [
  // Public Routes
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'register', component: Register, canActivate: [publicGuard] },
  { path: 'register-instructor', component: RegisterInstructor, canActivate: [publicGuard] },
  {
    path:'about',
    component: About
  },
  {
    path:'contact',
    component: ContactUs
  },
  // Home
  {
    path: 'home',
    component: HomeComponent,
    // canActivate: [authGuard], // Apply the guard here
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    data: {
      expectedRole: 'Admin',
    },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'users', component: ManageUsers },
      { path: 'courses', component: ManageCourses },
      { path: 'profile', component: Profile },
    ],
  },

  // Instructor Routes
  {
  path: 'instructor',
  component: InstructorLayout,
  canActivate: [authGuard],
  data: { expectedRole: 'Instructor' },
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: InstructorDashboardComponent }
    // { path: 'courses', component: ManageCourses },
    // { path: 'students', component: ManageUsers },
    // { path: 'profile', component: Profile }
  ]
  },

  // Course Routes
  {
    path: 'course/:id',
    component: CourseDetailComponent,
  },
  {
    path: 'course/:id/learn',
    component: CourseLearn,
    canActivate: [authGuard, enrolledGuard]
  },

  // ✨ QUIZ ROUTES
  {
    path: 'course/:courseId/quiz/list',
    component: QuizListComponent,
    canActivate: [authGuard, quizEnrolledGuard]
  },
  {
    path: 'course/:courseId/quiz/:quizId/attempt',
    component: QuizAttemptComponent,
    canActivate: [authGuard, quizEnrolledGuard]
  },
  {
    path: 'course/:courseId/quiz/results',
    component: QuizResultsComponent
    // ✅ REMOVED: canActivate: [authGuard]
    // No guards - open access to results page
  },

  // Default and Error Routes
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'unauthorized', component: Unauthorized },
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
      { path: 'quizzes', component: QuizSummaryComponent },
      // { path: 'profile', component: ProfileComponent },

      {
        path: 'profile', // When '/student/profile' is accessed
        component: ProfileComponent, // Load the profile wrapper
        children: [
          { path: '', redirectTo: 'public-profile', pathMatch: 'full' }, // Default sub-route
          { path: 'public-profile', component: PublicProfileComponent },
          { path: 'photo', component: PhotoProfileComponent },
        ]
      },

    ]
  },
  // Redirect to home by default if logged in, otherwise guard will redirect to login
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Wildcard route for 404
  { path: '**', redirectTo: '/unauthorized' },
];
