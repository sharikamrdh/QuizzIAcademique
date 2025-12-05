import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Nouveau cours</h1>
        <p>Créez un nouveau cours pour organiser vos documents</p>
      </div>
      
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Titre du cours</mat-label>
              <input matInput formControlName="title" placeholder="Ex: Introduction au Machine Learning">
              <mat-error *ngIf="form.get('title')?.hasError('required')">
                Le titre est requis
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4" 
                placeholder="Décrivez le contenu de ce cours..."></textarea>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Catégorie</mat-label>
              <mat-select formControlName="category">
                <mat-option value="science">Sciences</mat-option>
                <mat-option value="math">Mathématiques</mat-option>
                <mat-option value="history">Histoire</mat-option>
                <mat-option value="language">Langues</mat-option>
                <mat-option value="it">Informatique</mat-option>
                <mat-option value="other">Autre</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-checkbox formControlName="is_public" class="public-checkbox">
              Rendre ce cours public
            </mat-checkbox>
            <p class="checkbox-hint">Les cours publics peuvent être consultés par tous les utilisateurs</p>
            
            <div class="form-actions">
              <button mat-button type="button" routerLink="/courses">Annuler</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="loading || form.invalid">
                <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                <span *ngIf="!loading">Créer le cours</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-card {
      max-width: 600px;
    }
    
    .full-width {
      width: 100%;
    }
    
    mat-form-field {
      margin-bottom: 16px;
    }
    
    .public-checkbox {
      margin-top: 8px;
    }
    
    .checkbox-hint {
      font-size: 12px;
      color: #666;
      margin: 4px 0 24px 0;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }
  `]
})
export class CourseFormComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: ['other'],
      is_public: [false],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.courseService.createCourse(this.form.value).subscribe({
      next: (course) => {
        this.snackBar.open('Cours créé avec succès !', 'Fermer', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
        this.router.navigate(['/courses', course.id]);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors de la création', 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar',
        });
      },
    });
  }
}
