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
import { CourseService, Course } from '../../../core/services/course.service';

@Component({
  selector: 'app-course-list',
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
  ],
  template: `
    <div class="container">
      <div class="page-header">
        <div>
          <h1>Mes Cours</h1>
          <p>Gérez vos cours et documents</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/courses/new">
          <mat-icon>add</mat-icon>
          Nouveau cours
        </button>
      </div>
      
      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Rechercher</mat-label>
            <input matInput [(ngModel)]="searchQuery" (input)="onSearch()" placeholder="Titre du cours...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Catégorie</mat-label>
            <mat-select [(ngModel)]="categoryFilter" (selectionChange)="onSearch()">
              <mat-option value="">Toutes</mat-option>
              <mat-option value="science">Sciences</mat-option>
              <mat-option value="math">Mathématiques</mat-option>
              <mat-option value="history">Histoire</mat-option>
              <mat-option value="language">Langues</mat-option>
              <mat-option value="it">Informatique</mat-option>
              <mat-option value="other">Autre</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>
      
      <div class="loading-spinner" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>
      
      <!-- Course Grid -->
      <div class="card-grid" *ngIf="!loading">
        <mat-card *ngFor="let course of courses" class="course-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>{{ getCategoryIcon(course.category) }}</mat-icon>
            <mat-card-title>{{ course.title }}</mat-card-title>
            <mat-card-subtitle>{{ getCategoryLabel(course.category) }}</mat-card-subtitle>
            <button mat-icon-button [matMenuTriggerFor]="courseMenu" class="menu-button">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #courseMenu="matMenu">
              <button mat-menu-item [routerLink]="['/courses', course.id]">
                <mat-icon>visibility</mat-icon>
                <span>Voir</span>
              </button>
              <button mat-menu-item [routerLink]="['/quizzes/generate']" [queryParams]="{course: course.id}">
                <mat-icon>auto_awesome</mat-icon>
                <span>Générer quiz</span>
              </button>
              <button mat-menu-item (click)="deleteCourse(course)" class="delete-btn">
                <mat-icon>delete</mat-icon>
                <span>Supprimer</span>
              </button>
            </mat-menu>
          </mat-card-header>
          
          <mat-card-content>
            <p class="description">{{ course.description || 'Pas de description' }}</p>
            
            <div class="course-stats">
              <span>
                <mat-icon>description</mat-icon>
                {{ course.documents_count }} document(s)
              </span>
              <span *ngIf="course.is_public" class="public-badge">
                <mat-icon>public</mat-icon>
                Public
              </span>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button color="primary" [routerLink]="['/courses', course.id]">
              Ouvrir
            </button>
          </mat-card-actions>
        </mat-card>
        
        <!-- Empty State -->
        <div class="empty-state" *ngIf="courses.length === 0">
          <mat-icon>library_books</mat-icon>
          <h3>Aucun cours</h3>
          <p>Créez votre premier cours pour commencer</p>
          <button mat-raised-button color="primary" routerLink="/courses/new">
            Créer un cours
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
      
      mat-form-field {
        min-width: 200px;
      }
    }
    
    .course-card {
      display: flex;
      flex-direction: column;
      
      mat-card-header {
        position: relative;
        
        .menu-button {
          position: absolute;
          top: 8px;
          right: 8px;
        }
      }
      
      mat-card-content {
        flex: 1;
      }
      
      .description {
        color: #666;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .course-stats {
        display: flex;
        gap: 16px;
        color: #666;
        font-size: 14px;
        
        span {
          display: flex;
          align-items: center;
          gap: 4px;
          
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
        
        .public-badge {
          color: #4caf50;
        }
      }
    }
    
    .delete-btn {
      color: #f44336;
    }
    
    .empty-state {
      grid-column: 1 / -1;
    }
  `]
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  loading = true;
  searchQuery = '';
  categoryFilter = '';

  private categoryIcons: { [key: string]: string } = {
    science: 'science',
    math: 'calculate',
    history: 'history_edu',
    language: 'translate',
    it: 'computer',
    other: 'folder',
  };

  private categoryLabels: { [key: string]: string } = {
    science: 'Sciences',
    math: 'Mathématiques',
    history: 'Histoire',
    language: 'Langues',
    it: 'Informatique',
    other: 'Autre',
  };

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getCourses({
      search: this.searchQuery,
      category: this.categoryFilter,
    }).subscribe({
      next: (response) => {
        this.courses = response.results;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.loadCourses();
  }

  getCategoryIcon(category: string): string {
    return this.categoryIcons[category] || 'folder';
  }

  getCategoryLabel(category: string): string {
    return this.categoryLabels[category] || category;
  }

  deleteCourse(course: Course): void {
    if (confirm(`Supprimer le cours "${course.title}" ?`)) {
      this.courseService.deleteCourse(course.id).subscribe({
        next: () => {
          this.courses = this.courses.filter(c => c.id !== course.id);
        },
      });
    }
  }
}
