import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    MatSidenavModule,
  ],
  template: `
    <div class="app-container">
      <app-header 
        *ngIf="authService.isAuthenticated()"
        (toggleSidebar)="sidebarOpened = !sidebarOpened">
      </app-header>
      
      <mat-sidenav-container class="sidenav-container" *ngIf="authService.isAuthenticated(); else authContent">
        <mat-sidenav 
          #sidenav 
          mode="side" 
          [opened]="sidebarOpened"
          class="app-sidenav">
          <app-sidebar></app-sidebar>
        </mat-sidenav>
        
        <mat-sidenav-content class="main-content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
      
      <ng-template #authContent>
        <main class="auth-content">
          <router-outlet></router-outlet>
        </main>
      </ng-template>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    
    .sidenav-container {
      flex: 1;
    }
    
    .app-sidenav {
      width: 250px;
      background-color: #fafafa;
      border-right: 1px solid #e0e0e0;
    }
    
    .main-content {
      padding: 24px;
      background-color: #f5f5f5;
      min-height: calc(100vh - 64px);
    }
    
    .auth-content {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  `]
})
export class AppComponent {
  sidebarOpened = true;
  
  constructor(public authService: AuthService) {}
}
