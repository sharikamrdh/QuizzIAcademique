import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalyticsService, HistoryResponse } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Historique des quiz</h1>
        <p>Consultez vos résultats passés</p>
      </div>
      
      <mat-card>
        <div class="loading-spinner" *ngIf="loading">
          <mat-spinner></mat-spinner>
        </div>
        
        <div *ngIf="!loading">
          <table mat-table [dataSource]="history?.results || []" class="full-width">
            <ng-container matColumnDef="quiz">
              <th mat-header-cell *matHeaderCellDef>Quiz</th>
              <td mat-cell *matCellDef="let row">
                <div class="quiz-cell">
                  <strong>{{ row.quiz_title }}</strong>
                  <small>{{ row.course_title }}</small>
                </div>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="score">
              <th mat-header-cell *matHeaderCellDef>Score</th>
              <td mat-cell *matCellDef="let row">
                <span [class.passed]="row.passed" [class.failed]="!row.passed">
                  {{ row.score | number:'1.0-0' }}%
                </span>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="answers">
              <th mat-header-cell *matHeaderCellDef>Réponses</th>
              <td mat-cell *matCellDef="let row">
                {{ row.correct_answers }}/{{ row.total_questions }}
              </td>
            </ng-container>
            
            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef>Temps</th>
              <td mat-cell *matCellDef="let row">
                {{ formatTime(row.time_spent) }}
              </td>
            </ng-container>
            
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let row">
                {{ row.completed_at | date:'short' }}
              </td>
            </ng-container>
            
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let row">
                <mat-icon *ngIf="row.passed" class="success">check_circle</mat-icon>
                <mat-icon *ngIf="!row.passed" class="error">cancel</mat-icon>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button [routerLink]="['/quizzes', row.quiz_id]">
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          
          <div class="empty-state" *ngIf="history?.results?.length === 0">
            <mat-icon>history</mat-icon>
            <h3>Aucun historique</h3>
            <p>Vous n'avez pas encore complété de quiz.</p>
            <button mat-raised-button color="primary" routerLink="/quizzes">
              Passer un quiz
            </button>
          </div>
          
          <mat-paginator
            *ngIf="history && history.total > 0"
            [length]="history.total"
            [pageSize]="pageSize"
            [pageIndex]="page - 1"
            (page)="onPageChange($event)">
          </mat-paginator>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    
    .quiz-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px 0;
      
      small {
        color: #666;
      }
    }
    
    .passed { color: #4caf50; font-weight: 500; }
    .failed { color: #f44336; font-weight: 500; }
    
    .success { color: #4caf50; }
    .error { color: #f44336; }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }
  `]
})
export class HistoryComponent implements OnInit {
  loading = true;
  history: HistoryResponse | null = null;
  page = 1;
  pageSize = 20;
  
  displayedColumns = ['quiz', 'score', 'answers', 'time', 'date', 'status', 'actions'];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.analyticsService.getHistory({ page: this.page, page_size: this.pageSize }).subscribe({
      next: (data) => {
        this.history = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadHistory();
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
}
