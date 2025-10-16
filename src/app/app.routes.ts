import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { authGuard } from './services/auth-guard';
import { Register } from './components/auth/register/register';
import { ManageCourses } from './components/admin/manage-courses/manage-courses';
import { ManageUsers } from './components/admin/manage-users/manage-users';
import { Profile } from './components/admin/profile/profile';
import { RegisterInstructor } from './components/auth/register-instructor/register-instructor';
import { AdminDashboard } from './components/admin/dashboard/dashboard';
import { HomeLayout } from './components/home/layout/layout';
import { AdminLayout } from './components/admin/layout/layout';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: 'register-instructor', component: RegisterInstructor },
  {
    path: 'home',
    component: HomeLayout,
    canActivate: [authGuard], // Apply the guard here
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
  // Redirect to home by default if logged in, otherwise guard will redirect to login
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Wildcard route for 404
  { path: '**', redirectTo: '/unauthorized' },
];
