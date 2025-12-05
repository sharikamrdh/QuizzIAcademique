import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { QuizAttempt } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
  ],
  template: `
    <div class="container result-container" *ngIf="attempt">
      <!-- Result Header -->
      <mat-card class="result-header" [class.passed]="attempt.is_passed" [class.failed]="!attempt.is_passed">
        <div class="result-icon">
          <mat-icon *ngIf="attempt.is_passed">emoji_events</mat-icon>
          <mat-icon *ngIf="!attempt.is_passed">sentiment_dissatisfied</mat-icon>
        </div>
        <h1 *ngIf="attempt.is_passed">Félicitations !</h1>
        <h1 *ngIf="!attempt.is_passed">Quiz terminé</h1>
        <p *ngIf="attempt.is_passed">Vous avez réussi ce quiz !</p>
        <p *ngIf="!attempt.is_passed">Vous pouvez réessayer pour améliorer votre score.</p>
      </mat-card>
      
      <!-- Score Card -->
      <mat-card class="score-card">
        <div class="score-display">
          <div class="score-circle" [class.passed]="attempt.is_passed" [class.failed]="!attempt.is_passed">
            <span class="score-value">{{ attempt.score | number:'1.0-0' }}%</span>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat">
            <mat-icon>check_circle</mat-icon>
            <div>
              <strong>{{ attempt.correct_answers }}</strong>
              <span>Bonnes réponses</span>
            </div>
          </div>
          <div class="stat">
            <mat-icon>help</mat-icon>
            <div>
              <strong>{{ attempt.total_questions }}</strong>
              <span>Questions</span>
            </div>
          </div>
          <div class="stat">
            <mat-icon>timer</mat-icon>
            <div>
              <strong>{{ formatTime(attempt.time_spent) }}</strong>
              <span>Temps passé</span>
            </div>
          </div>
          <div class="stat">
            <mat-icon>stars</mat-icon>
            <div>
              <strong>{{ attempt.points_earned }}</strong>
              <span>Points gagnés</span>
            </div>
          </div>
        </div>
      </mat-card>
      
      <!-- Detailed Results -->
      <mat-card *ngIf="attempt.answers && attempt.answers.length > 0">
        <mat-card-header>
          <mat-card-title>Détail des réponses</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-accordion>
            <mat-expansion-panel *ngFor="let answer of attempt.answers; let i = index"
              [class.correct]="answer.is_correct" [class.incorrect]="!answer.is_correct">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon [class.success]="answer.is_correct" [class.error]="!answer.is_correct">
                    {{ answer.is_correct ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                  Question {{ i + 1 }}
                </mat-panel-title>
                <mat-panel-description>
                  {{ answer.is_correct ? 'Correct' : 'Incorrect' }} - {{ answer.points_earned }} pt(s)
                </mat-panel-description>
              </mat-expansion-panel-header>
              
              <div class="answer-detail">
                <p class="question-text"><strong>{{ answer.question_text }}</strong></p>
                
                <div class="answer-comparison">
                  <div class="your-answer" [class.correct]="answer.is_correct" [class.incorrect]="!answer.is_correct">
                    <label>Votre réponse :</label>
                    <span>{{ answer.answer || '(Pas de réponse)' }}</span>
                  </div>
                  
                  <div class="correct-answer" *ngIf="!answer.is_correct">
                    <label>Bonne réponse :</label>
                    <span>{{ answer.correct_answer }}</span>
                  </div>
                </div>
                
                <div class="explanation" *ngIf="answer.explanation">
                  <mat-icon>lightbulb</mat-icon>
                  <p>{{ answer.explanation }}</p>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </mat-card-content>
      </mat-card>
      
      <!-- Actions -->
      <div class="actions">
        <button mat-button routerLink="/quizzes">
          <mat-icon>list</mat-icon>
          Tous les quiz
        </button>
        <button mat-button routerLink="/dashboard">
          <mat-icon>dashboard</mat-icon>
          Tableau de bord
        </button>
        <button mat-raised-button color="primary" [routerLink]="['/quizzes', attempt.quiz, 'play']">
          <mat-icon>replay</mat-icon>
          Réessayer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .result-container { max-width: 800px; margin: 0 auto; }
    .result-header { text-align: center; padding: 40px; margin-bottom: 24px; }
    .result-header.passed { background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%); color: white; }
    .result-header.failed { background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%); color: white; }
    .result-icon mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    .score-card { margin-bottom: 24px; padding: 24px; }
    .score-display { display: flex; justify-content: center; margin-bottom: 24px; }
    .score-circle { width: 150px; height: 150px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 8px solid; }
    .score-circle.passed { border-color: #4caf50; }
    .score-circle.failed { border-color: #ff9800; }
    .score-value { font-size: 36px; font-weight: 700; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .stat { display: flex; align-items: center; gap: 12px; mat-icon { color: #3f51b5; } div { display: flex; flex-direction: column; } strong { font-size: 20px; } span { font-size: 12px; color: #666; } }
    mat-expansion-panel { margin-bottom: 8px; &.correct { border-left: 4px solid #4caf50; } &.incorrect { border-left: 4px solid #f44336; } }
    .success { color: #4caf50; }
    .error { color: #f44336; }
    .answer-detail { padding: 16px 0; }
    .question-text { margin-bottom: 16px; }
    .answer-comparison { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .your-answer, .correct-answer { padding: 12px; border-radius: 8px; label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; } span { font-weight: 500; } }
    .your-answer.correct { background: #e8f5e9; }
    .your-answer.incorrect { background: #ffebee; }
    .correct-answer { background: #e8f5e9; }
    .explanation { display: flex; gap: 12px; padding: 12px; background: #fff8e1; border-radius: 8px; mat-icon { color: #ffc107; } p { margin: 0; color: #666; } }
    .actions { display: flex; justify-content: center; gap: 16px; margin-top: 24px; }
  `]
})
export class QuizResultComponent implements OnInit {
  attempt: QuizAttempt | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state?.['attempt']) {
      this.attempt = state['attempt'];
    } else {
      // Try to get from history state
      this.attempt = history.state.attempt;
    }
    
    if (!this.attempt) {
      this.router.navigate(['/quizzes']);
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
}
