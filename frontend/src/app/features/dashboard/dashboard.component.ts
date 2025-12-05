import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="container">
      <h1>Tableau de bord</h1>
      <div class="loading-spinner" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>
      <div *ngIf="!loading">
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-icon>quiz</mat-icon>
            <div class="stat-content">
              <span class="stat-value">{{ stats?.total_quizzes || 0 }}</span>
              <span class="stat-label">Quiz completes</span>
            </div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon>check_circle</mat-icon>
            <div class="stat-content">
              <span class="stat-value">{{ stats?.passed_quizzes || 0 }}</span>
              <span class="stat-label">Quiz reussis</span>
            </div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon>trending_up</mat-icon>
            <div class="stat-content">
              <span class="stat-value">{{ stats?.average_score || 0 }}%</span>
              <span class="stat-label">Score moyen</span>
            </div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon>stars</mat-icon>
            <div class="stat-content">
              <span class="stat-value">{{ stats?.total_points || 0 }}</span>
              <span class="stat-label">Points totaux</span>
            </div>
          </mat-card>
        </div>
        <mat-card class="actions-card">
          <mat-card-header>
            <mat-card-title>Actions rapides</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="actions-grid">
              <button mat-raised-button color="primary" routerLink="/quizzes/generate">
                <mat-icon>auto_awesome</mat-icon>
                Generer un quiz
              </button>
              <button mat-raised-button routerLink="/courses/new">
                <mat-icon>add</mat-icon>
                Nouveau cours
              </button>
              <button mat-raised-button routerLink="/quizzes">
                <mat-icon>play_arrow</mat-icon>
                Passer un quiz
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin-bottom: 24px; }
    .stat-card { display: flex; align-items: center; padding: 24px; gap: 16px; }
    .stat-card mat-icon { font-size: 48px; width: 48px; height: 48px; color: #3f51b5; }
    .stat-content { display: flex; flex-direction: column; }
    .stat-value { font-size: 32px; font-weight: 700; }
    .stat-label { font-size: 14px; color: #666; }
    .actions-card { margin-bottom: 24px; }
    .actions-grid { display: flex; gap: 16px; flex-wrap: wrap; }
    .loading-spinner { display: flex; justify-content: center; padding: 60px; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  loading = true;
  constructor(private analyticsService: AnalyticsService) {}
  ngOnInit(): void {
    this.loadDashboard();
  }
  loadDashboard(): void {
    this.analyticsService.getDashboard().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
