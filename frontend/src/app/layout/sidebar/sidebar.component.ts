import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: `
    <nav class="sidebar-nav">
      <mat-nav-list>
        <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle>Tableau de bord</span>
        </a>
        
        <a mat-list-item routerLink="/courses" routerLinkActive="active">
          <mat-icon matListItemIcon>library_books</mat-icon>
          <span matListItemTitle>Mes cours</span>
        </a>
        
        <a mat-list-item routerLink="/quizzes" routerLinkActive="active">
          <mat-icon matListItemIcon>quiz</mat-icon>
          <span matListItemTitle>Quiz</span>
        </a>
        
        <a mat-list-item routerLink="/quizzes/generate" routerLinkActive="active">
          <mat-icon matListItemIcon>auto_awesome</mat-icon>
          <span matListItemTitle>Générer un quiz</span>
        </a>
        
        <mat-divider></mat-divider>
        
        <a mat-list-item routerLink="/history" routerLinkActive="active">
          <mat-icon matListItemIcon>history</mat-icon>
          <span matListItemTitle>Historique</span>
        </a>
      </mat-nav-list>
    </nav>
  `,
  styles: [`
    .sidebar-nav {
      padding: 16px 0;
    }
    
    mat-nav-list {
      a {
        margin: 4px 8px;
        border-radius: 8px;
        
        &.active {
          background-color: rgba(63, 81, 181, 0.1);
          color: #3f51b5;
          
          mat-icon {
            color: #3f51b5;
          }
        }
      }
    }
    
    mat-divider {
      margin: 16px 0;
    }
  `]
})
export class SidebarComponent {}
