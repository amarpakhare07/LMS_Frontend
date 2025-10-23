// import { Routes } from '@angular/router';
// import { LoginComponent } from './components/auth/login/login';
// import { authGuard } from './services/auth-guard';
// import { Register } from './components/auth/register/register';
// import { ManageCourses } from './components/admin/manage-courses/manage-courses';
// import { ManageUsers } from './components/admin/manage-users/manage-users';
// import { Profile } from './components/admin/profile/profile';
// import { RegisterInstructor } from './components/auth/register-instructor/register-instructor';
// import { AdminDashboard } from './components/admin/dashboard/dashboard';
// import { AdminLayout } from './components/admin/layout/layout';
// import { HomeComponent } from './components/home/home';
// import { InstructorLayout } from './components/instructor/instructor';
// import { DashboardLayout } from './components/dashboard-layout/dashboard-layout';
// import { Unauthorized } from './components/unauthorized/unauthorized';
// import { publicGuard } from './services/public-guard';
// import { CourseDetailComponent } from './components/course/course-detail/course-detail';
// import { CourseLearn } from './components/course/course-learn/course-learn';
// import { enrolledGuard } from './services/enrolled-guard';

// export const routes: Routes = [
//   { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
//   { path: 'register', component: Register, canActivate: [publicGuard] },
//   { path: 'register-instructor', component: RegisterInstructor, canActivate: [publicGuard] },
//   {
//     path: 'home',
//     component: HomeComponent,
//     // canActivate: [authGuard], // Apply the guard here
//   },
//   {
//     path: 'instructor',
//     component: InstructorLayout,
//     canActivate: [authGuard], // Apply the same guard
//   },
//   {
//     path: 'admin',
//     component: AdminLayout,
//     canActivate: [authGuard], // Apply the same guard
//     data: {
//       expectedRole: 'Admin', // ✨ Add the required role here
//     },
//     children: [
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default admin route
//       { path: 'dashboard', component: AdminDashboard },
//       { path: 'users', component: ManageUsers },
//       { path: 'courses', component: ManageCourses },
//       { path: 'profile', component: Profile },
//     ],
//   },
//   {
//     path: 'instructor',
//     component: InstructorLayout,
//     canActivate: [authGuard],
//     data: { expectedRole: 'Instructor' },
//     children: [
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//       //   { path: 'dashboard', component: InstructorDashboard },
//       //   { path: 'courses', component: ManageCourses },
//       //   { path: 'students', component: ManageUsers },
//       //   { path: 'profile', component: Profile }
//     ],
//   },

//   { 
//     path: 'course/:id', 
//     component: CourseDetailComponent,
//   },
//   {
//     path: 'course/:id/learn',
//     component: CourseLearn,
//     canActivate: [authGuard, enrolledGuard]
//   },

//   // Redirect to home by default if logged in, otherwise guard will redirect to login
//   { path: '', redirectTo: '/home', pathMatch: 'full' },
//   { path: 'unauthorized', component: Unauthorized },
//   // Wildcard route for 404
//   { path: '**', redirectTo: '/unauthorized' },
// ];






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
import { DashboardLayout } from './components/dashboard-layout/dashboard-layout';
import { Unauthorized } from './components/unauthorized/unauthorized';
import { publicGuard } from './services/public-guard';
import { CourseDetailComponent } from './components/course/course-detail/course-detail';
import { CourseLearn } from './components/course/course-learn/course-learn';
import { enrolledGuard } from './services/enrolled-guard';

// Import Quiz Components
import { QuizListComponent } from './components/quiz/quiz-list/quiz-list';
import { QuizAttemptComponent } from './components/quiz/quiz-attempt/quiz-attempt';
import { QuizResultsComponent } from './components/quiz/quiz-result/quiz-result';
import { quizEnrolledGuard } from './services/quiz-enrolled.guard';

export const routes: Routes = [
  // Public Routes
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'register', component: Register, canActivate: [publicGuard] },
  { path: 'register-instructor', component: RegisterInstructor, canActivate: [publicGuard] },
  
  // Home
  {
    path: 'home',
    component: HomeComponent,
  },

  // Admin Routes
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
      // Add instructor routes here
    ],
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

  // ✨ QUIZ ROUTES - Protected with authGuard + quizEnrolledGuard
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
    component: QuizResultsComponent,
    canActivate: [authGuard]
    // Note: Results page only needs authGuard, not enrollment check
    // because user already completed the quiz
  },

  // Default and Error Routes
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'unauthorized', component: Unauthorized },
  { path: '**', redirectTo: '/unauthorized' },
];