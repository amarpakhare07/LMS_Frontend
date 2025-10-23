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
// import { StudentLayout } from './components/student/layout/student-layout/student-layout';
// import { StudentDashboard } from './components/student/dashboard/student-dashboard/student-dashboard';
// import { StudentMyCourses } from './components/student/my-courses/student-my-courses/student-my-courses';
// import { StudentQuiz } from './components/student/quiz/student-quiz/student-quiz';
// import { StudentQuizHistory } from './components/student/quiz-history/student-quiz-history/student-quiz-history';
import { StudentLayout } from './components/student/layout/student-layout/student-layout';
//import { StudentDashboardComponent } from './components/student/dashboard/student-dashboard/student-dashboard';
import { DashboardComponent as StudentDashboardComponent } from './components/student/dashboard/student-dashboard/student-dashboard';
import { MyCoursesComponent } from './components/student/my-courses/student-my-courses/student-my-courses';
import { ProfileComponent } from './components/student/my-profile/my-profile/my-profile';
//import { StudentQuiz } from './components/student/quiz/quiz';
// ...existing code...
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: 'register-instructor', component: RegisterInstructor },
  {
    path: 'home',
    component: HomeComponent,
    // canActivate: [authGuard], // Apply the guard here
  },
  {
    path: 'instructor',
    component: InstructorLayout,
    canActivate: [authGuard], // Apply the same guard
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
      { path: 'profile', component: Profile }
    ]
  },
  {
  path: 'instructor',
  component: InstructorLayout,
  canActivate: [authGuard],
  data: { expectedRole: 'Instructor' },
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
  //   { path: 'dashboard', component: InstructorDashboard },
  //   { path: 'courses', component: ManageCourses },
  //   { path: 'students', component: ManageUsers },
  //   { path: 'profile', component: Profile }
  ]
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
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'my-courses', component: MyCoursesComponent },
      { path: 'profile', component: ProfileComponent },
    ]
  },
  // Redirect to home by default if logged in, otherwise guard will redirect to login
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Wildcard route for 404
  { path: '**', redirectTo: '/unauthorized' },
];
