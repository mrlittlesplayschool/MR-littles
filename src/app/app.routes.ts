import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [

  // ── Public website (navbar + footer layout)
  {
    path: '',
    loadComponent: () =>
      import('./public/public-layout/public-layout').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./public/home/home').then(m => m.HomeComponent)
      },
    ]
  },

  // ── Auth pages (no navbar/footer)
  {
    path: 'owner-login',
    loadComponent: () => import('./auth/owner-login/owner-login')
      .then(m => m.OwnerLoginComponent)
  },

  // ── Teacher Login
  {
    path: 'teacher-login',
    loadComponent: () => import('./auth/teacher-login/teacher-login')
      .then(m => m.TeacherLoginComponent)
  },

  // ── Shared Dashboard (owner + teacher, same layout)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/owner-layout/owner-layout')
      .then(m => m.OwnerLayoutComponent),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () => import('./dashboard/dashboard/dashboard')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./dashboard/students/students')
          .then(m => m.StudentsComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./dashboard/attendance/attendance')
          .then(m => m.AttendanceComponent)
      },
      {
        path: 'fees',
        loadComponent: () => import('./dashboard/fees/fees')
          .then(m => m.FeesComponent)
      },
      {
        path: 'fee-structure',
        canActivate: [roleGuard],
        data: { role: 'owner' },
        loadComponent: () => import('./dashboard/fee-structure/fee-structure')
          .then(m => m.FeeStructureComponent)
      },
      {
        path: 'teachers',
        canActivate: [roleGuard],
        data: { role: 'owner' },
        loadComponent: () => import('./dashboard/teachers/teachers')
          .then(m => m.TeachersComponent)
      },
      {
        path: 'enquiries',
        loadComponent: () => import('./dashboard/enquiries/enquiries')
          .then(m => m.EnquiriesComponent)
      },
    ]
  },

  // ── Fallback
  { path: '**', redirectTo: 'owner-login' }

];