import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  template: `
    <mat-toolbar color="primary" class="header">
      <button mat-icon-button (click)="toggleSidebar.emit()">
        <mat-icon>menu</mat-icon>
      </button>
      
      <span class="logo" routerLink="/dashboard">
        <mat-icon>school</mat-icon>
        Quiz Generator
      </span>
      
      <span class="spacer"></span>
      
      <div class="user-info" *ngIf="authService.user() as user">
        <span class="points">
          <mat-icon>stars</mat-icon>
          {{ user.total_points }} pts
        </span>
        <span class="level">Niveau {{ user.level }}</span>
        
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        
        <mat-menu #userMenu="matMenu">
          <div class="menu-header">
            <strong>{{ user.username }}</strong>
            <small>{{ user.email }}</small>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>Mon profil</span>
          </button>
          <button mat-menu-item routerLink="/history">
            <mat-icon>history</mat-icon>
            <span>Historique</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Déconnexion</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 16px;
      font-size: 20px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }
    
    .spacer {
      flex: 1;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .points {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 14px;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }
    
    .level {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .menu-header {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      small {
        color: #666;
      }
    }
  `]
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  constructor(public authService: AuthService) {}
  
  logout(): void {
    this.authService.logout();
  }
}
