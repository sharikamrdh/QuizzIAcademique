import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { QuizService, Quiz } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
  ],
  template: `
    <div class="container">
      <div class="loading-spinner" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>
      
      <div *ngIf="!loading && quiz">
        <div class="page-header">
          <div>
            <button mat-icon-button routerLink="/quizzes" class="back-btn">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <h1>{{ quiz.title }}</h1>
            <p>{{ quiz.course_title }}</p>
          </div>
          <div class="header-actions">
            <button mat-button [routerLink]="['/flashcards', quiz.id]">
              <mat-icon>style</mat-icon>
              Flashcards
            </button>
            <button mat-raised-button color="primary" [routerLink]="['/quizzes', quiz.id, 'play']">
              <mat-icon>play_arrow</mat-icon>
              Commencer le quiz
            </button>
          </div>
        </div>
        
        <!-- Quiz Info -->
        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <mat-icon>help</mat-icon>
                <div>
                  <strong>{{ quiz.questions_count }}</strong>
                  <span>Questions</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>timer</mat-icon>
                <div>
                  <strong>{{ quiz.time_limit || '∞' }}</strong>
                  <span>Minutes</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>trending_up</mat-icon>
                <div>
                  <strong>{{ quiz.passing_score }}%</strong>
                  <span>Score requis</span>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>stars</mat-icon>
                <div>
                  <strong>{{ quiz.total_points }}</strong>
                  <span>Points max</span>
                </div>
              </div>
            </div>
            
            <mat-chip-set class="quiz-chips">
              <mat-chip [class]="quiz.difficulty">
                {{ getDifficultyLabel(quiz.difficulty) }}
              </mat-chip>
              <mat-chip *ngIf="quiz.shuffle_questions">
                Questions mélangées
              </mat-chip>
            </mat-chip-set>
          </mat-card-content>
        </mat-card>
        
        <!-- Questions Preview -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Aperçu des questions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-accordion>
              <mat-expansion-panel *ngFor="let q of quiz.questions; let i = index">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <span class="q-number">Q{{ i + 1 }}</span>
                    <span class="q-type">{{ getTypeLabel(q.question_type) }}</span>
                  </mat-panel-title>
                  <mat-panel-description>
                    {{ q.text | slice:0:60 }}{{ q.text.length > 60 ? '...' : '' }}
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="question-content">
                  <p><strong>{{ q.text }}</strong></p>
                  
                  <div *ngIf="q.choices && q.choices.length > 0" class="choices">
                    <div *ngFor="let choice of q.choices" class="choice">
                      • {{ choice }}
                    </div>
                  </div>
                  
                  <p class="points">{{ q.points }} point(s)</p>
                </div>
              </mat-expansion-panel>
            </mat-accordion>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .back-btn { margin-right: 8px; vertical-align: middle; }
    .header-actions { display: flex; gap: 12px; }
    .info-card { margin-bottom: 24px; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 24px; margin-bottom: 16px; }
    .info-item { display: flex; align-items: center; gap: 12px; mat-icon { color: #3f51b5; font-size: 32px; width: 32px; height: 32px; } div { display: flex; flex-direction: column; } strong { font-size: 24px; } span { font-size: 12px; color: #666; } }
    .quiz-chips mat-chip { &.debutant { background: #e8f5e9; color: #2e7d32; } &.intermediaire { background: #fff3e0; color: #ef6c00; } &.avance { background: #ffebee; color: #c62828; } }
    .q-number { background: #3f51b5; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px; font-size: 12px; }
    .q-type { background: #e0e0e0; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .question-content { padding: 16px 0; }
    .choices { margin: 16px 0; padding-left: 16px; }
    .choice { margin: 8px 0; color: #666; }
    .points { color: #3f51b5; font-size: 14px; }
  `]
})
export class QuizDetailComponent implements OnInit {
  quiz: Quiz | null = null;
  loading = true;

  constructor(private route: ActivatedRoute, private quizService: QuizService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadQuiz(id);
  }

  loadQuiz(id: number): void {
    this.quizService.getQuiz(id).subscribe({
      next: (quiz) => { this.quiz = quiz; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  getDifficultyLabel(d: string): string {
    return { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' }[d] || d;
  }

  getTypeLabel(t: string): string {
    return { qcm: 'QCM', vf: 'Vrai/Faux', ouvert: 'Ouvert', completion: 'Complétion' }[t] || t;
  }
}
