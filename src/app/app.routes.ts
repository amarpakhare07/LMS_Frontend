import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { Home } from './pages/home/home';
import { authGuard } from './services/auth-guard';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Register } from './components/auth/register/register';
import { RegisterInstructor } from './register-instructor/register-instructor';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: 'register-instructor', component: RegisterInstructor },
  {
    path: 'home',
    component: Home,
    canActivate: [authGuard], // Apply the guard here
  },
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard], // Apply the same guard
    data: {
      expectedRole: 'Admin', // ✨ Add the required role here
    },
  },
  // Redirect to home by default if logged in, otherwise guard will redirect to login
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Wildcard route for 404
  { path: '**', redirectTo: '/unauthorized' },
];
