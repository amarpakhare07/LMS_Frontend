import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { Home } from './pages/home/home';
import { authGuard } from './services/auth-guard';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Register } from './components/auth/register/register';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
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
      expectedRole: 'admin', // ✨ Add the required role here
    },
  },
  // Redirect to home by default if logged in, otherwise guard will redirect to login
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Wildcard route for 404
  { path: '**', redirectTo: '/home' },
];
