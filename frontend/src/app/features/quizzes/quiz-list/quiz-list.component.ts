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
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QuizService, Quiz } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/services/auth.service';

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
    MatMenuModule,
    MatSnackBarModule,
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
            
            <!-- Menu 3 points pour les quiz créés par l'utilisateur -->
            <button mat-icon-button 
              *ngIf="isMyQuiz(quiz)"
              [matMenuTriggerFor]="quizMenu" 
              class="menu-button">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #quizMenu="matMenu">
              <button mat-menu-item [routerLink]="['/quizzes', quiz.id]">
                <mat-icon>visibility</mat-icon>
                <span>Voir</span>
              </button>
              <button mat-menu-item (click)="publishQuiz(quiz)" *ngIf="quiz.status === 'draft'">
                <mat-icon>publish</mat-icon>
                <span>Publier</span>
              </button>
              <button mat-menu-item (click)="deleteQuiz(quiz)" class="delete-btn">
                <mat-icon>delete</mat-icon>
                <span>Supprimer</span>
              </button>
            </mat-menu>
          </mat-card-header>
          
          <mat-card-content>
            <div class="quiz-info">
              <span class="difficulty" [class]="quiz.difficulty">
                {{ getDifficultyLabel(quiz.difficulty) }}
              </span>
              <span>{{ quiz.questions_count }} questions</span>
              <span *ngIf="quiz.time_limit > 0">{{ quiz.time_limit }} min</span>
              <span *ngIf="quiz.status === 'draft'" class="status-badge draft">Brouillon</span>
              <span *ngIf="quiz.status === 'published'" class="status-badge published">Publié</span>
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
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
    }
    
    .filters-card { 
      margin-bottom: 24px; 
    }
    
    .filters { 
      display: flex; 
      gap: 16px; 
      flex-wrap: wrap; 
    }
    
    .quiz-card {
      mat-card-header {
        position: relative;
        
        .menu-button {
          position: absolute;
          top: 8px;
          right: 8px;
        }
      }
      
      mat-card-actions { 
        display: flex; 
        justify-content: space-between; 
      }
    }
    
    .quiz-info { 
      display: flex; 
      gap: 16px; 
      color: #666; 
      font-size: 14px;
      flex-wrap: wrap;
      align-items: center;
    }
    
    .difficulty { 
      padding: 4px 8px; 
      border-radius: 4px; 
      font-size: 12px; 
    }
    
    .difficulty.debutant { 
      background: #e8f5e9; 
      color: #2e7d32; 
    }
    
    .difficulty.intermediaire { 
      background: #fff3e0; 
      color: #ef6c00; 
    }
    
    .difficulty.avance { 
      background: #ffebee; 
      color: #c62828; 
    }
    
    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .status-badge.draft {
      background: #fafafa;
      color: #757575;
      border: 1px solid #e0e0e0;
    }
    
    .status-badge.published {
      background: #e3f2fd;
      color: #1976d2;
    }
    
    .delete-btn {
      color: #f44336;
    }
    
    .empty-state { 
      grid-column: 1 / -1; 
      text-align: center; 
      padding: 60px; 
    }
  `]
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];
  loading = true;
  searchQuery = '';
  difficultyFilter = '';

  constructor(
    private quizService: QuizService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

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
      error: () => { 
        this.loading = false; 
      },
    });
  }

  onSearch(): void {
    this.loadQuizzes();
  }

  getDifficultyLabel(d: string): string {
    const labels: Record<string, string> = { 
      debutant: 'Débutant', 
      intermediaire: 'Intermédiaire', 
      avance: 'Avancé' 
    };
    return labels[d] || d;
  }

  isMyQuiz(quiz: Quiz): boolean {
    const currentUser = this.authService.user();
    return currentUser ? quiz.created_by === currentUser.id : false;
  }

  publishQuiz(quiz: Quiz): void {
    this.quizService.publishQuiz(quiz.id).subscribe({
      next: () => {
        this.snackBar.open('Quiz publié avec succès !', 'Fermer', {
          duration: 3000,
        });
        this.loadQuizzes();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la publication', 'Fermer', {
          duration: 5000,
        });
      },
    });
  }

  deleteQuiz(quiz: Quiz): void {
    const confirmation = confirm(
      `Êtes-vous sûr de vouloir supprimer le quiz "${quiz.title}" ?\n\n` +
      `Cette action est irréversible et supprimera également :\n` +
      `• Toutes les questions (${quiz.questions_count})\n` +
      `• Toutes les tentatives des étudiants\n` +
      `• Toutes les statistiques associées`
    );

    if (!confirmation) return;

    this.quizService.deleteQuiz(quiz.id).subscribe({
      next: () => {
        this.snackBar.open('Quiz supprimé avec succès', 'Fermer', {
          duration: 3000,
        });
        this.quizzes = this.quizzes.filter(q => q.id !== quiz.id);
      },
      error: () => {
        this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
          duration: 5000,
        });
      },
    });
  }
}
