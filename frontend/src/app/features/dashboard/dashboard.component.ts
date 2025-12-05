import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AnalyticsService, DashboardData } from '../../core/services/analytics.service';

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
    MatChipsModule,
    BaseChartDirective,
  ],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Tableau de bord</h1>
        <p>Bienvenue ! Voici votre progression.</p>
      </div>
      
      <div class="loading-spinner" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>
      
      <div *ngIf="!loading && data">
        <!-- Stats Overview -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-icon>quiz</mat-icon>
            <div class="stat-value">{{ data.summary.total_quizzes }}</div>
            <div class="stat-label">Quiz complétés</div>
          </mat-card>
          
          <mat-card class="stat-card">
            <mat-icon>check_circle</mat-icon>
            <div class="stat-value">{{ data.summary.passed_quizzes }}</div>
            <div class="stat-label">Quiz réussis</div>
          </mat-card>
          
          <mat-card class="stat-card">
            <mat-icon>trending_up</mat-icon>
            <div class="stat-value">{{ data.summary.avg_score | number:'1.0-0' }}%</div>
            <div class="stat-label">Score moyen</div>
          </mat-card>
          
          <mat-card class="stat-card">
            <mat-icon>stars</mat-icon>
            <div class="stat-value">{{ data.summary.total_points }}</div>
            <div class="stat-label">Points totaux</div>
          </mat-card>
        </div>
        
        <!-- Quick Actions -->
        <mat-card class="quick-actions">
          <mat-card-header>
            <mat-card-title>Actions rapides</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="action-buttons">
              <button mat-raised-button color="primary" routerLink="/quizzes/generate">
                <mat-icon>auto_awesome</mat-icon>
                Générer un quiz
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
        
        <div class="charts-row">
          <!-- Activity Chart -->
          <mat-card class="chart-card" *ngIf="activityChartData">
            <mat-card-header>
              <mat-card-title>Activité des 7 derniers jours</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="activityChartData"
                [options]="chartOptions"
                type="bar">
              </canvas>
            </mat-card-content>
          </mat-card>
          
          <!-- Performance by Type -->
          <mat-card class="chart-card" *ngIf="performanceChartData">
            <mat-card-header>
              <mat-card-title>Performance par type de question</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="performanceChartData"
                [options]="chartOptions"
                type="doughnut">
              </canvas>
            </mat-card-content>
          </mat-card>
        </div>
        
        <!-- Recent Quizzes -->
        <mat-card *ngIf="data.recent_quizzes.length > 0">
          <mat-card-header>
            <mat-card-title>Derniers quiz</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="recent-list">
              <div class="recent-item" *ngFor="let quiz of data.recent_quizzes">
                <div class="quiz-info">
                  <strong>{{ quiz.quiz_title }}</strong>
                  <small>{{ quiz.completed_at | date:'short' }}</small>
                </div>
                <div class="quiz-score">
                  <span [class.passed]="quiz.passed" [class.failed]="!quiz.passed">
                    {{ quiz.score | number:'1.0-0' }}%
                  </span>
                  <mat-icon *ngIf="quiz.passed" class="success">check_circle</mat-icon>
                  <mat-icon *ngIf="!quiz.passed" class="error">cancel</mat-icon>
                </div>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/history">
              Voir tout l'historique
            </button>
          </mat-card-actions>
        </mat-card>
        
        <!-- Badges -->
        <mat-card *ngIf="data.badges.length > 0">
          <mat-card-header>
            <mat-card-title>Mes badges</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="badges-grid">
              <div class="badge-item" *ngFor="let badge of data.badges">
                <mat-icon>{{ badge.icon }}</mat-icon>
                <span>{{ badge.name }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .stat-card {
      text-align: center;
      padding: 24px;
      
      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #3f51b5;
        margin-bottom: 16px;
      }
      
      .stat-value {
        font-size: 36px;
        font-weight: 500;
        color: #333;
      }
      
      .stat-label {
        font-size: 14px;
        color: #666;
        margin-top: 8px;
      }
    }
    
    .quick-actions {
      margin-bottom: 24px;
    }
    
    .action-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      
      button {
        mat-icon {
          margin-right: 8px;
        }
      }
    }
    
    .charts-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .chart-card mat-card-content {
      height: 300px;
    }
    
    .recent-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .recent-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      
      .quiz-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        small {
          color: #666;
        }
      }
      
      .quiz-score {
        display: flex;
        align-items: center;
        gap: 8px;
        
        span {
          font-weight: 500;
          font-size: 18px;
          
          &.passed { color: #4caf50; }
          &.failed { color: #f44336; }
        }
        
        mat-icon {
          &.success { color: #4caf50; }
          &.error { color: #f44336; }
        }
      }
    }
    
    .badges-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .badge-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      min-width: 100px;
      
      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        margin-bottom: 8px;
      }
    }
    
    mat-card {
      margin-bottom: 24px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  data: DashboardData | null = null;
  
  activityChartData: ChartConfiguration['data'] | null = null;
  performanceChartData: ChartConfiguration['data'] | null = null;
  
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.analyticsService.getDashboard().subscribe({
      next: (data) => {
        this.data = data;
        this.buildCharts();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  buildCharts(): void {
    if (!this.data) return;

    // Activity chart
    if (this.data.daily_activity.length > 0) {
      this.activityChartData = {
        labels: this.data.daily_activity.map(d => new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short' })),
        datasets: [{
          label: 'Quiz complétés',
          data: this.data.daily_activity.map(d => d.count),
          backgroundColor: '#3f51b5',
        }],
      };
    }

    // Performance chart
    if (this.data.question_performance.length > 0) {
      const typeLabels: { [key: string]: string } = {
        'qcm': 'QCM',
        'vf': 'Vrai/Faux',
        'ouvert': 'Ouvert',
        'completion': 'Complétion',
      };
      
      this.performanceChartData = {
        labels: this.data.question_performance.map(p => typeLabels[p.type] || p.type),
        datasets: [{
          data: this.data.question_performance.map(p => p.accuracy),
          backgroundColor: ['#3f51b5', '#e91e63', '#00bcd4', '#ff9800'],
        }],
      };
    }
  }
}
