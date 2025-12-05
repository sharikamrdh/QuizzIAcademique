import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <mat-card class="login-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>school</mat-icon>
        <mat-card-title>Connexion</mat-card-title>
        <mat-card-subtitle>Quiz Generator</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="votre@email.com">
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="form.get('email')?.hasError('required')">
              L'email est requis
            </mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">
              Email invalide
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mot de passe</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('password')?.hasError('required')">
              Le mot de passe est requis
            </mat-error>
          </mat-form-field>
          
          <button 
            mat-raised-button 
            color="primary" 
            type="submit" 
            class="full-width submit-btn"
            [disabled]="loading || form.invalid">
            <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
            <span *ngIf="!loading">Se connecter</span>
          </button>
        </form>
      </mat-card-content>
      
      <mat-card-actions align="end">
        <span>Pas encore de compte ?</span>
        <a mat-button color="primary" routerLink="/register">S'inscrire</a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 24px;
    }
    
    mat-card-header {
      margin-bottom: 24px;
      
      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #3f51b5;
      }
    }
    
    .full-width {
      width: 100%;
    }
    
    mat-form-field {
      margin-bottom: 16px;
    }
    
    .submit-btn {
      height: 48px;
      font-size: 16px;
      margin-top: 16px;
      
      mat-spinner {
        margin: 0 auto;
      }
    }
    
    mat-card-actions {
      padding: 16px 0 0;
      gap: 8px;
    }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.snackBar.open('Connexion réussie !', 'Fermer', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        const message = error.error?.detail || 'Identifiants incorrects';
        this.snackBar.open(message, 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar',
        });
      },
    });
  }
}
