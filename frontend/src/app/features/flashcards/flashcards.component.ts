import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { QuizService, Flashcard } from '../../core/services/quiz.service';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="container flashcards-container">
      <div class="page-header">
        <div>
          <button mat-icon-button (click)="goBack()" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>Mode Flashcards</h1>
          <p>Cliquez sur la carte pour révéler la réponse</p>
        </div>
      </div>
      
      <div class="loading-spinner" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>
      
      <div *ngIf="!loading && flashcards.length > 0" class="flashcard-wrapper">
        <!-- Progress -->
        <div class="progress-info">
          <span>Carte {{ currentIndex + 1 }} / {{ flashcards.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progressPercent"></div>
          </div>
        </div>
        
        <!-- Flashcard -->
        <div class="flashcard" [class.flipped]="isFlipped" (click)="flipCard()">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <mat-icon>help_outline</mat-icon>
              <p>{{ currentCard.front }}</p>
            </div>
            <div class="flashcard-back">
              <mat-icon>lightbulb</mat-icon>
              <p>{{ currentCard.back }}</p>
              <small *ngIf="currentCard.hint">💡 {{ currentCard.hint }}</small>
            </div>
          </div>
        </div>
        
        <!-- Navigation -->
        <div class="navigation">
          <button mat-fab color="basic" (click)="previousCard()" [disabled]="currentIndex === 0">
            <mat-icon>chevron_left</mat-icon>
          </button>
          
          <div class="card-dots">
            <span *ngFor="let card of flashcards; let i = index"
              class="dot"
              [class.active]="i === currentIndex"
              [class.viewed]="viewedCards.has(i)"
              (click)="goToCard(i)">
            </span>
          </div>
          
          <button mat-fab color="basic" (click)="nextCard()" [disabled]="currentIndex === flashcards.length - 1">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
        
        <!-- Actions -->
        <div class="actions">
          <button mat-button (click)="shuffleCards()">
            <mat-icon>shuffle</mat-icon>
            Mélanger
          </button>
          <button mat-button (click)="resetProgress()">
            <mat-icon>restart_alt</mat-icon>
            Recommencer
          </button>
        </div>
      </div>
      
      <div class="empty-state" *ngIf="!loading && flashcards.length === 0">
        <mat-icon>style</mat-icon>
        <h3>Aucune flashcard disponible</h3>
        <p>Ce quiz n'a pas de flashcards associées.</p>
        <button mat-raised-button color="primary" (click)="goBack()">Retour</button>
      </div>
    </div>
  `,
  styles: [`
    .flashcards-container { max-width: 600px; margin: 0 auto; }
    .back-btn { margin-right: 8px; vertical-align: middle; }
    
    .flashcard-wrapper { display: flex; flex-direction: column; align-items: center; }
    
    .progress-info { width: 100%; margin-bottom: 24px; text-align: center; span { color: #666; margin-bottom: 8px; display: block; } }
    .progress-bar { height: 4px; background: #e0e0e0; border-radius: 2px; overflow: hidden; }
    .progress-fill { height: 100%; background: #3f51b5; transition: width 0.3s; }
    
    .flashcard { width: 100%; max-width: 500px; height: 350px; perspective: 1000px; cursor: pointer; margin-bottom: 24px; }
    .flashcard-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
    .flashcard.flipped .flashcard-inner { transform: rotateY(180deg); }
    .flashcard-front, .flashcard-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px; border-radius: 16px; text-align: center; }
    .flashcard-front { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.8; } p { font-size: 20px; line-height: 1.5; } }
    .flashcard-back { background: white; transform: rotateY(180deg); border: 2px solid #e0e0e0; box-shadow: 0 4px 20px rgba(0,0,0,0.1); mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; color: #ffc107; } p { font-size: 20px; line-height: 1.5; color: #333; } small { margin-top: 16px; color: #666; font-size: 14px; } }
    
    .navigation { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
    .card-dots { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; max-width: 300px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: #e0e0e0; cursor: pointer; transition: all 0.2s; }
    .dot.active { background: #3f51b5; transform: scale(1.3); }
    .dot.viewed { background: #4caf50; }
    
    .actions { display: flex; gap: 16px; }
    
    .empty-state { text-align: center; padding: 60px; mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; } }
  `]
})
export class FlashcardsComponent implements OnInit {
  flashcards: Flashcard[] = [];
  loading = true;
  currentIndex = 0;
  isFlipped = false;
  viewedCards = new Set<number>();
  quizId!: number;

  constructor(private route: ActivatedRoute, private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.loadFlashcards();
  }

  loadFlashcards(): void {
    this.quizService.getFlashcards(this.quizId).subscribe({
      next: (cards) => {
        this.flashcards = cards;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  get currentCard(): Flashcard {
    return this.flashcards[this.currentIndex];
  }

  get progressPercent(): number {
    return ((this.currentIndex + 1) / this.flashcards.length) * 100;
  }

  flipCard(): void {
    this.isFlipped = !this.isFlipped;
    if (this.isFlipped) {
      this.viewedCards.add(this.currentIndex);
    }
  }

  previousCard(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
    }
  }

  nextCard(): void {
    if (this.currentIndex < this.flashcards.length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
    }
  }

  goToCard(index: number): void {
    this.currentIndex = index;
    this.isFlipped = false;
  }

  shuffleCards(): void {
    this.flashcards = [...this.flashcards].sort(() => Math.random() - 0.5);
    this.currentIndex = 0;
    this.isFlipped = false;
    this.viewedCards.clear();
  }

  resetProgress(): void {
    this.currentIndex = 0;
    this.isFlipped = false;
    this.viewedCards.clear();
  }

  goBack(): void {
    history.back();
  }
}
