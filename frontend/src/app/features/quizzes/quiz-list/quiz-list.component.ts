import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { QuizService, Quiz } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="container">
      <div class="page-header">
        <div>
          <h1>Quiz disponibles</h1>
          <p>Sélectionnez un quiz pour commencer</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/quizzes/generate">
          <mat-icon>auto_awesome</mat-icon>
          Générer un nouveau quiz
        </button>
      </div>
      
      <mat-card class="filters-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Rechercher</mat-label>
            <input matInput [(ngModel)]="searchQuery" (input)="onSearch()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Difficulté</mat-label>
            <mat-select [(ngModel)]="difficultyFilter" (selectionChange)="onSearch()">
              <mat-option value="">Toutes</mat-option>
              <mat-option value="debutant">Débutant</mat-option>
              <mat-option value="intermediaire">Intermédiaire</mat-option>
              <mat-option value="avance">Avancé</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>
      
      <div class="loading-spinner" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>
      
      <div class="card-grid" *ngIf="!loading">
        <mat-card *ngFor="let quiz of quizzes" class="quiz-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>quiz</mat-icon>
            <mat-card-title>{{ quiz.title }}</mat-card-title>
            <mat-card-subtitle>{{ quiz.course_title }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="quiz-info">
              <span class="difficulty" [class]="quiz.difficulty">
                {{ getDifficultyLabel(quiz.difficulty) }}
              </span>
              <span>{{ quiz.questions_count }} questions</span>
              <span *ngIf="quiz.time_limit > 0">{{ quiz.time_limit }} min</span>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button [routerLink]="['/quizzes', quiz.id]">Détails</button>
            <button mat-raised-button color="primary" [routerLink]="['/quizzes', quiz.id, 'play']">
              <mat-icon>play_arrow</mat-icon>
              Commencer
            </button>
          </mat-card-actions>
        </mat-card>
        
        <div class="empty-state" *ngIf="quizzes.length === 0">
          <mat-icon>quiz</mat-icon>
          <h3>Aucun quiz disponible</h3>
          <button mat-raised-button color="primary" routerLink="/quizzes/generate">
            Générer un quiz
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .filters-card { margin-bottom: 24px; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; }
    .quiz-card mat-card-actions { display: flex; justify-content: space-between; }
    .quiz-info { display: flex; gap: 16px; color: #666; font-size: 14px; }
    .difficulty { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .difficulty.debutant { background: #e8f5e9; color: #2e7d32; }
    .difficulty.intermediaire { background: #fff3e0; color: #ef6c00; }
    .difficulty.avance { background: #ffebee; color: #c62828; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px; }
  `]
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];
  loading = true;
  searchQuery = '';
  difficultyFilter = '';

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.loading = true;
    this.quizService.getQuizzes({
      search: this.searchQuery,
      difficulty: this.difficultyFilter,
    }).subscribe({
      next: (response) => {
        this.quizzes = response.results;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  onSearch(): void {
    this.loadQuizzes();
  }

  getDifficultyLabel(d: string): string {
    const labels: Record<string, string> = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' };
    return labels[d] || d;
  }
}
