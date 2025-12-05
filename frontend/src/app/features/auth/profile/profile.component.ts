import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Mon Profil</h1>
      </div>
      
      <mat-tab-group>
        <mat-tab label="Informations">
          <div class="tab-content">
            <mat-card>
              <mat-card-content>
                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
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
                    <mat-label>Institution</mat-label>
                    <input matInput formControlName="institution">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Biographie</mat-label>
                    <textarea matInput formControlName="bio" rows="4"></textarea>
                  </mat-form-field>
                  
                  <button mat-raised-button color="primary" type="submit" [disabled]="saving">
                    <mat-spinner diameter="20" *ngIf="saving"></mat-spinner>
                    <span *ngIf="!saving">Enregistrer</span>
                  </button>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
        
        <mat-tab label="Sécurité">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Changer le mot de passe</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Mot de passe actuel</mat-label>
                    <input matInput type="password" formControlName="old_password">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nouveau mot de passe</mat-label>
                    <input matInput type="password" formControlName="new_password">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Confirmer le nouveau mot de passe</mat-label>
                    <input matInput type="password" formControlName="new_password_confirm">
                  </mat-form-field>
                  
                  <button mat-raised-button color="warn" type="submit" [disabled]="changingPassword">
                    <mat-spinner diameter="20" *ngIf="changingPassword"></mat-spinner>
                    <span *ngIf="!changingPassword">Changer le mot de passe</span>
                  </button>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
        
        <mat-tab label="Statistiques">
          <div class="tab-content">
            <div class="stats-grid" *ngIf="authService.user() as user">
              <mat-card class="stat-card">
                <div class="stat-value">{{ user.total_points }}</div>
                <div class="stat-label">Points totaux</div>
              </mat-card>
              
              <mat-card class="stat-card">
                <div class="stat-value">{{ user.level }}</div>
                <div class="stat-label">Niveau</div>
              </mat-card>
              
              <mat-card class="stat-card">
                <div class="stat-value">{{ user.badges_count }}</div>
                <div class="stat-label">Badges</div>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .tab-content {
      padding: 24px 0;
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
      margin-bottom: 16px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    
    button {
      min-width: 150px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  saving = false;
  changingPassword = false;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      institution: [''],
      bio: [''],
    });

    this.passwordForm = this.fb.group({
      old_password: [''],
      new_password: [''],
      new_password_confirm: [''],
    });
  }

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.profileForm.patchValue({
        first_name: user.first_name,
        last_name: user.last_name,
        institution: user.institution,
        bio: user.bio,
      });
    }
  }

  updateProfile(): void {
    this.saving = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Profil mis à jour !', 'Fermer', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar',
        });
      },
    });
  }

  changePassword(): void {
    const { old_password, new_password, new_password_confirm } = this.passwordForm.value;
    
    if (new_password !== new_password_confirm) {
      this.snackBar.open('Les mots de passe ne correspondent pas', 'Fermer', {
        duration: 5000,
        panelClass: 'error-snackbar',
      });
      return;
    }

    this.changingPassword = true;
    this.authService.changePassword(old_password, new_password, new_password_confirm).subscribe({
      next: () => {
        this.changingPassword = false;
        this.passwordForm.reset();
        this.snackBar.open('Mot de passe modifié !', 'Fermer', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
      },
      error: (error) => {
        this.changingPassword = false;
        const message = error.error?.old_password || 'Erreur lors du changement';
        this.snackBar.open(message, 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar',
        });
      },
    });
  }
}
