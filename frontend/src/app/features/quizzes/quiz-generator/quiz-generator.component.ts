import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { CourseService, Course } from '../../../core/services/course.service';
import { QuizService } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-generator',
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
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatChipsModule,
  ],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Générer un Quiz avec l'IA</h1>
        <p>Créez automatiquement des questions à partir de vos documents</p>
      </div>
      
      <mat-card class="generator-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Course Selection -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Cours source</mat-label>
              <mat-select formControlName="course_id" (selectionChange)="onCourseChange($event.value)">
                <mat-option *ngFor="let course of courses" [value]="course.id">
                  {{ course.title }} ({{ course.documents_count }} documents)
                </mat-option>
              </mat-select>
              <mat-error>Sélectionnez un cours</mat-error>
            </mat-form-field>
            
            <!-- Documents Selection -->
            <div class="documents-section" *ngIf="selectedCourse">
              <label>Documents à utiliser (optionnel)</label>
              <mat-chip-listbox formControlName="document_ids" multiple>
                <mat-chip-option *ngFor="let doc of selectedCourse.documents" [value]="doc.id"
                  [disabled]="doc.processing_status !== 'completed'">
                  {{ doc.title }}
                  <span *ngIf="doc.processing_status !== 'completed'" class="doc-status">
                    ({{ doc.processing_status }})
                  </span>
                </mat-chip-option>
              </mat-chip-listbox>
              <small>Laissez vide pour utiliser tous les documents</small>
            </div>
            
            <!-- Quiz Title -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Titre du quiz (optionnel)</mat-label>
              <input matInput formControlName="title" placeholder="Sera généré automatiquement si vide">
            </mat-form-field>
            
            <!-- Number of Questions -->
            <div class="slider-field">
              <label>Nombre de questions: {{ form.get('nb_questions')?.value }}</label>
              <mat-slider min="1" max="30" step="1" discrete>
                <input matSliderThumb formControlName="nb_questions">
              </mat-slider>
            </div>
            
            <!-- Difficulty -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Difficulté</mat-label>
              <mat-select formControlName="difficulty">
                <mat-option value="debutant">Débutant</mat-option>
                <mat-option value="intermediaire">Intermédiaire</mat-option>
                <mat-option value="avance">Avancé</mat-option>
              </mat-select>
            </mat-form-field>
            
            <!-- Question Types -->
            <div class="checkbox-group">
              <label>Types de questions</label>
              <div class="checkboxes">
                <mat-checkbox formControlName="type_qcm">QCM</mat-checkbox>
                <mat-checkbox formControlName="type_vf">Vrai/Faux</mat-checkbox>
                <mat-checkbox formControlName="type_ouvert">Question ouverte</mat-checkbox>
                <mat-checkbox formControlName="type_completion">Complétion</mat-checkbox>
              </div>
            </div>
            
            <!-- Time Limit -->
            <div class="slider-field">
              <label>Temps limite: {{ form.get('time_limit')?.value }} minutes (0 = illimité)</label>
              <mat-slider min="0" max="120" step="5" discrete>
                <input matSliderThumb formControlName="time_limit">
              </mat-slider>
            </div>
            
            <!-- Submit -->
            <div class="form-actions">
              <button mat-button type="button" routerLink="/quizzes">Annuler</button>
              <button mat-raised-button color="primary" type="submit" 
                [disabled]="generating || form.invalid || !hasSelectedTypes()">
                <mat-spinner diameter="20" *ngIf="generating"></mat-spinner>
                <mat-icon *ngIf="!generating">auto_awesome</mat-icon>
                <span *ngIf="!generating">Générer le quiz</span>
                <span *ngIf="generating">Génération en cours...</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
      
      <!-- Info Card -->
      <mat-card class="info-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>info</mat-icon>
          <mat-card-title>Comment ça marche ?</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <ol>
            <li>Sélectionnez un cours contenant des documents traités</li>
            <li>Configurez les paramètres du quiz</li>
            <li>L'IA analysera le contenu et générera des questions pertinentes</li>
            <li>Vous pourrez ensuite réviser et modifier les questions</li>
          </ol>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .generator-card { max-width: 700px; margin-bottom: 24px; }
    .info-card { max-width: 700px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .slider-field { margin-bottom: 24px; label { display: block; margin-bottom: 8px; color: #666; } }
    .checkbox-group { margin-bottom: 24px; label { display: block; margin-bottom: 8px; color: #666; } }
    .checkboxes { display: flex; flex-wrap: wrap; gap: 16px; }
    .documents-section { margin-bottom: 24px; label { display: block; margin-bottom: 8px; color: #666; } small { color: #999; display: block; margin-top: 8px; } }
    .doc-status { font-size: 11px; color: #999; }
    .form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px; }
    ol { padding-left: 20px; li { margin-bottom: 8px; color: #666; } }
  `]
})
export class QuizGeneratorComponent implements OnInit {
  form: FormGroup;
  courses: Course[] = [];
  selectedCourse: Course | null = null;
  generating = false;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private quizService: QuizService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      course_id: [null, Validators.required],
      document_ids: [[]],
      title: [''],
      nb_questions: [10],
      difficulty: ['intermediaire'],
      type_qcm: [true],
      type_vf: [true],
      type_ouvert: [false],
      type_completion: [false],
      time_limit: [30],
    });
  }

  ngOnInit(): void {
    this.loadCourses();
    
    // Pre-select course from query params
    const courseId = this.route.snapshot.queryParamMap.get('course');
    if (courseId) {
      this.form.patchValue({ course_id: Number(courseId) });
    }
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (response) => {
        this.courses = response.results.filter(c => c.documents_count > 0);
        
        // Load selected course details if pre-selected
        const courseId = this.form.get('course_id')?.value;
        if (courseId) {
          this.onCourseChange(courseId);
        }
      },
    });
  }

  onCourseChange(courseId: number): void {
    this.courseService.getCourse(courseId).subscribe({
      next: (course) => {
        this.selectedCourse = course;
      },
    });
  }

  hasSelectedTypes(): boolean {
    return this.form.get('type_qcm')?.value ||
           this.form.get('type_vf')?.value ||
           this.form.get('type_ouvert')?.value ||
           this.form.get('type_completion')?.value;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.hasSelectedTypes()) return;

    this.generating = true;
    
    const questionTypes: string[] = [];
    if (this.form.get('type_qcm')?.value) questionTypes.push('qcm');
    if (this.form.get('type_vf')?.value) questionTypes.push('vf');
    if (this.form.get('type_ouvert')?.value) questionTypes.push('ouvert');
    if (this.form.get('type_completion')?.value) questionTypes.push('completion');

    const params = {
      course_id: this.form.get('course_id')?.value,
      document_ids: this.form.get('document_ids')?.value || [],
      title: this.form.get('title')?.value || undefined,
      nb_questions: this.form.get('nb_questions')?.value,
      difficulty: this.form.get('difficulty')?.value,
      question_types: questionTypes,
      time_limit: this.form.get('time_limit')?.value,
    };

    this.quizService.generateQuiz(params).subscribe({
      next: (quiz) => {
        this.snackBar.open('Quiz généré avec succès !', 'Fermer', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
        this.router.navigate(['/quizzes', quiz.id]);
      },
      error: (error) => {
        this.generating = false;
        const message = error.error?.error || 'Erreur lors de la génération';
        this.snackBar.open(message, 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar',
        });
      },
    });
  }
}
