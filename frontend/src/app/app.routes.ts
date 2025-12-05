import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'courses',
    loadComponent: () => import('./features/courses/course-list/course-list.component').then(m => m.CourseListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'courses/new',
    loadComponent: () => import('./features/courses/course-form/course-form.component').then(m => m.CourseFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'courses/:id',
    loadComponent: () => import('./features/courses/course-detail/course-detail.component').then(m => m.CourseDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'quizzes',
    loadComponent: () => import('./features/quizzes/quiz-list/quiz-list.component').then(m => m.QuizListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'quizzes/generate',
    loadComponent: () => import('./features/quizzes/quiz-generator/quiz-generator.component').then(m => m.QuizGeneratorComponent),
    canActivate: [authGuard],
  },
  {
    path: 'quizzes/:id',
    loadComponent: () => import('./features/quizzes/quiz-detail/quiz-detail.component').then(m => m.QuizDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'quizzes/:id/play',
    loadComponent: () => import('./features/quizzes/quiz-player/quiz-player.component').then(m => m.QuizPlayerComponent),
    canActivate: [authGuard],
  },
  {
    path: 'quizzes/:id/result',
    loadComponent: () => import('./features/quizzes/quiz-result/quiz-result.component').then(m => m.QuizResultComponent),
    canActivate: [authGuard],
  },
  {
    path: 'flashcards/:quizId',
    loadComponent: () => import('./features/flashcards/flashcards.component').then(m => m.FlashcardsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'history',
    loadComponent: () => import('./features/dashboard/history/history.component').then(m => m.HistoryComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/auth/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
