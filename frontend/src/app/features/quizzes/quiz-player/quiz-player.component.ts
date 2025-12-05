import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';
import { QuizService, Quiz, Question, QuizAttempt } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-player',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="quiz-player" *ngIf="!loading && questions.length > 0">
      <!-- Header -->
      <div class="quiz-header">
        <div class="quiz-info">
          <h2>{{ quiz?.title }}</h2>
          <span>Question {{ currentIndex + 1 }} / {{ questions.length }}</span>
        </div>
        <div class="quiz-timer" [class.warning]="remainingTime < 300" [class.danger]="remainingTime < 60">
          <mat-icon>timer</mat-icon>
          {{ formatTime(remainingTime) }}
        </div>
      </div>
      
      <!-- Progress -->
      <mat-progress-bar mode="determinate" [value]="progressPercent"></mat-progress-bar>
      
      <!-- Question Card -->
      <mat-card class="question-card">
        <div class="question-header">
          <span class="question-type">{{ getTypeLabel(currentQuestion.question_type) }}</span>
          <span class="question-points">{{ currentQuestion.points }} pt(s)</span>
        </div>
        
        <div class="question-text">
          {{ currentQuestion.text }}
        </div>
        
        <!-- QCM / Vrai-Faux -->
        <mat-radio-group 
          *ngIf="currentQuestion.question_type === 'qcm' || currentQuestion.question_type === 'vf'"
          [(ngModel)]="answers[currentQuestion.id]"
          class="choices-group">
          <mat-radio-button 
            *ngFor="let choice of currentQuestion.choices" 
            [value]="choice"
            class="choice-option">
            {{ choice }}
          </mat-radio-button>
        </mat-radio-group>
        
        <!-- Open / Completion -->
        <mat-form-field 
          *ngIf="currentQuestion.question_type === 'ouvert' || currentQuestion.question_type === 'completion'"
          appearance="outline" 
          class="full-width">
          <mat-label>Votre réponse</mat-label>
          <input matInput [(ngModel)]="answers[currentQuestion.id]" 
            [placeholder]="currentQuestion.question_type === 'completion' ? 'Mot ou phrase manquante' : 'Écrivez votre réponse'">
        </mat-form-field>
      </mat-card>
      
      <!-- Navigation -->
      <div class="navigation">
        <button mat-button (click)="previousQuestion()" [disabled]="currentIndex === 0">
          <mat-icon>chevron_left</mat-icon>
          Précédent
        </button>
        
        <div class="question-dots">
          <span *ngFor="let q of questions; let i = index"
            class="dot"
            [class.active]="i === currentIndex"
            [class.answered]="answers[q.id]"
            (click)="goToQuestion(i)">
          </span>
        </div>
        
        <button mat-button *ngIf="currentIndex < questions.length - 1" (click)="nextQuestion()">
          Suivant
          <mat-icon>chevron_right</mat-icon>
        </button>
        
        <button mat-raised-button color="primary" *ngIf="currentIndex === questions.length - 1" 
          (click)="submitQuiz()" [disabled]="submitting">
          <mat-spinner diameter="20" *ngIf="submitting"></mat-spinner>
          <span *ngIf="!submitting">Terminer le quiz</span>
        </button>
      </div>
    </div>
    
    <div class="loading-spinner" *ngIf="loading">
      <mat-spinner></mat-spinner>
      <p>Chargement du quiz...</p>
    </div>
  `,
  styles: [`
    .quiz-player { max-width: 800px; margin: 0 auto; padding: 20px; }
    .quiz-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .quiz-info h2 { margin: 0 0 4px 0; }
    .quiz-info span { color: #666; font-size: 14px; }
    .quiz-timer { display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 500; }
    .quiz-timer.warning { color: #ff9800; }
    .quiz-timer.danger { color: #f44336; animation: pulse 1s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    mat-progress-bar { margin-bottom: 24px; }
    .question-card { padding: 24px; margin-bottom: 24px; }
    .question-header { display: flex; justify-content: space-between; margin-bottom: 16px; }
    .question-type { background: #e8eaf6; color: #3f51b5; padding: 4px 12px; border-radius: 4px; font-size: 12px; text-transform: uppercase; }
    .question-points { color: #666; }
    .question-text { font-size: 18px; line-height: 1.6; margin-bottom: 24px; }
    .choices-group { display: flex; flex-direction: column; gap: 12px; }
    .choice-option { padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.2s; }
    .choice-option:hover { background: #f5f5f5; }
    .full-width { width: 100%; }
    .navigation { display: flex; justify-content: space-between; align-items: center; }
    .question-dots { display: flex; gap: 8px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; background: #e0e0e0; cursor: pointer; transition: all 0.2s; }
    .dot.active { background: #3f51b5; transform: scale(1.2); }
    .dot.answered { background: #4caf50; }
    .loading-spinner { text-align: center; padding: 60px; }
  `]
})
export class QuizPlayerComponent implements OnInit, OnDestroy {
  quiz: Quiz | null = null;
  attempt: QuizAttempt | null = null;
  questions: Question[] = [];
  answers: { [questionId: number]: string } = {};
  currentIndex = 0;
  loading = true;
  submitting = false;
  remainingTime = 0;
  startTime = Date.now();
  private timerSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.startQuiz(id);
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  startQuiz(quizId: number): void {
    this.quizService.startAttempt(quizId).subscribe({
      next: (data) => {
        this.attempt = data.attempt;
        this.questions = data.questions;
        this.loading = false;
        
        // Get quiz info
        this.quizService.getQuiz(quizId).subscribe(q => {
          this.quiz = q;
          if (q.time_limit > 0) {
            this.remainingTime = q.time_limit * 60;
            this.startTimer();
          }
        });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement du quiz', 'Fermer', { duration: 5000 });
        this.router.navigate(['/quizzes']);
      },
    });
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.submitQuiz();
      }
    });
  }

  get currentQuestion(): Question {
    return this.questions[this.currentIndex];
  }

  get progressPercent(): number {
    return ((this.currentIndex + 1) / this.questions.length) * 100;
  }

  previousQuestion(): void {
    if (this.currentIndex > 0) this.currentIndex--;
  }

  nextQuestion(): void {
    if (this.currentIndex < this.questions.length - 1) this.currentIndex++;
  }

  goToQuestion(index: number): void {
    this.currentIndex = index;
  }

  submitQuiz(): void {
    this.timerSubscription?.unsubscribe();
    this.submitting = true;
    
    const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
    const formattedAnswers = Object.entries(this.answers).map(([qId, answer]) => ({
      question_id: Number(qId),
      answer: answer || '',
    }));

    this.quizService.submitAttempt(this.quiz!.id, formattedAnswers, timeSpent).subscribe({
      next: (result) => {
        this.router.navigate(['/quizzes', this.quiz!.id, 'result'], {
          state: { attempt: result }
        });
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('Erreur lors de la soumission', 'Fermer', { duration: 5000 });
      },
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getTypeLabel(t: string): string {
    return { qcm: 'QCM', vf: 'Vrai/Faux', ouvert: 'Question ouverte', completion: 'Complétion' }[t] || t;
  }
}
