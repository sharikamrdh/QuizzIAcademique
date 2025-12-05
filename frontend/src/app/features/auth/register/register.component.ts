import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <mat-card class="register-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>school</mat-icon>
        <mat-card-title>Inscription</mat-card-title>
        <mat-card-subtitle>Créer un compte Quiz Generator</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Prénom</mat-label>
              <input matInput formControlName="first_name">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="last_name">
            </mat-form-field>
          </div>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom d'utilisateur</mat-label>
            <input matInput formControlName="username">
            <mat-error *ngIf="form.get('username')?.hasError('required')">
              Requis
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email">
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
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">
              8 caractères minimum
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirmer le mot de passe</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password_confirm">
            <mat-error *ngIf="form.get('password_confirm')?.hasError('required')">
              Confirmation requise
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Rôle</mat-label>
            <mat-select formControlName="role">
              <mat-option value="student">Étudiant</mat-option>
              <mat-option value="teacher">Enseignant</mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Institution (optionnel)</mat-label>
            <input matInput formControlName="institution">
          </mat-form-field>
          
          <button 
            mat-raised-button 
            color="primary" 
            type="submit" 
            class="full-width submit-btn"
            [disabled]="loading || form.invalid">
            <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
            <span *ngIf="!loading">S'inscrire</span>
          </button>
        </form>
      </mat-card-content>
      
      <mat-card-actions align="end">
        <span>Déjà un compte ?</span>
        <a mat-button color="primary" routerLink="/login">Se connecter</a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .register-card {
      width: 100%;
      max-width: 500px;
      padding: 24px;
      max-height: 90vh;
      overflow-y: auto;
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
    
    .form-row {
      display: flex;
      gap: 16px;
      
      mat-form-field {
        flex: 1;
      }
    }
    
    .full-width {
      width: 100%;
    }
    
    mat-form-field {
      margin-bottom: 8px;
    }
    
    .submit-btn {
      height: 48px;
      font-size: 16px;
      margin-top: 16px;
    }
    
    mat-card-actions {
      padding: 16px 0 0;
      gap: 8px;
    }
  `]
})
export class RegisterComponent {
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
      first_name: [''],
      last_name: [''],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirm: ['', Validators.required],
      role: ['student'],
      institution: [''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.form.value.password !== this.form.value.password_confirm) {
      this.snackBar.open('Les mots de passe ne correspondent pas', 'Fermer', {
        duration: 5000,
        panelClass: 'error-snackbar',
      });
      return;
    }

    this.loading = true;

    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Inscription réussie ! Vous pouvez vous connecter.', 'Fermer', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        const message = error.error?.email?.[0] || error.error?.username?.[0] || 'Erreur lors de l\'inscription';
        this.snackBar.open(message, 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar',
        });
      },
    });
  }
}
