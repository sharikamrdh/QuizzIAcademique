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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
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
    MatDialogModule,
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

            <!-- Zone de danger -->
            <mat-card class="danger-zone">
              <mat-card-header>
                <mat-card-title>Zone de danger</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p class="warning-text">
                  <mat-icon>warning</mat-icon>
                  La suppression de votre compte est irréversible. Toutes vos données (cours, quiz, badges) seront définitivement perdues.
                </p>
                <button mat-raised-button color="warn" (click)="confirmDeleteAccount()" [disabled]="deleting">
                  <mat-spinner diameter="20" *ngIf="deleting"></mat-spinner>
                  <mat-icon *ngIf="!deleting">delete_forever</mat-icon>
                  <span *ngIf="!deleting">Supprimer mon compte</span>
                </button>
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

    .danger-zone {
      margin-top: 24px;
      border: 2px solid #f44336;

      mat-card-title {
        color: #f44336;
      }

      .warning-text {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
        margin-bottom: 16px;
        padding: 12px;
        background: #ffebee;
        border-radius: 4px;

        mat-icon {
          color: #f44336;
        }
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  saving = false;
  changingPassword = false;
  deleting = false;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
        });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
          duration: 5000,
        });
      },
    });
  }

  changePassword(): void {
    const { old_password, new_password, new_password_confirm } = this.passwordForm.value;
    
    if (new_password !== new_password_confirm) {
      this.snackBar.open('Les mots de passe ne correspondent pas', 'Fermer', {
        duration: 5000,
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
        });
      },
      error: (error) => {
        this.changingPassword = false;
        const message = error.error?.old_password || 'Erreur lors du changement';
        this.snackBar.open(message, 'Fermer', {
          duration: 5000,
        });
      },
    });
  }

  confirmDeleteAccount(): void {
    const confirmation = confirm(
      '⚠️ ATTENTION ⚠️\n\n' +
      'Vous êtes sur le point de supprimer définitivement votre compte.\n\n' +
      'Toutes vos données seront perdues :\n' +
      '• Vos cours\n' +
      '• Vos quiz\n' +
      '• Vos statistiques\n' +
      '• Vos badges\n\n' +
      'Cette action est IRRÉVERSIBLE.\n\n' +
      'Voulez-vous vraiment continuer ?'
    );

    if (!confirmation) return;

    const secondConfirmation = confirm(
      'Dernière confirmation : Êtes-vous absolument certain de vouloir supprimer votre compte ?'
    );

    if (secondConfirmation) {
      this.deleteAccount();
    }
  }

  deleteAccount(): void {
    this.deleting = true;
    this.authService.deleteAccount().subscribe({
      next: () => {
        this.snackBar.open('Votre compte a été supprimé', 'OK', {
          duration: 3000,
        });
        this.authService.logout();
      },
      error: () => {
        this.deleting = false;
        this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
          duration: 5000,
        });
      },
    });
  }
}
