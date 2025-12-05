import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { CourseService, Course, Document } from '../../../core/services/course.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSnackBarModule,
    MatListModule,
    MatMenuModule,
  ],
  template: `
    <div class="container">
      <div class="loading-spinner" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>
      
      <div *ngIf="!loading && course">
        <div class="page-header">
          <div>
            <button mat-icon-button routerLink="/courses" class="back-btn">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <h1>{{ course.title }}</h1>
            <p>{{ course.description || 'Pas de description' }}</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" 
              [routerLink]="['/quizzes/generate']" 
              [queryParams]="{course: course.id}"
              [disabled]="!hasCompletedDocuments">
              <mat-icon>auto_awesome</mat-icon>
              Générer un quiz
            </button>
          </div>
        </div>
        
        <!-- Upload Section -->
        <mat-card class="upload-card">
          <mat-card-header>
            <mat-card-title>Ajouter des documents</mat-card-title>
            <mat-card-subtitle>PDF, DOCX, TXT ou images (max 10 MB)</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div 
              class="upload-zone"
              [class.dragover]="isDragging"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()">
              <mat-icon>cloud_upload</mat-icon>
              <p>Glissez-déposez vos fichiers ici</p>
              <p>ou cliquez pour parcourir</p>
              <input 
                #fileInput 
                type="file" 
                hidden 
                multiple
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                (change)="onFileSelect($event)">
            </div>
            
            <mat-progress-bar *ngIf="uploading" mode="indeterminate"></mat-progress-bar>
          </mat-card-content>
        </mat-card>
        
        <!-- Documents List -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Documents ({{ course.documents?.length || 0 }})</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list *ngIf="course.documents && course.documents.length > 0">
              <mat-list-item *ngFor="let doc of course.documents">
                <mat-icon matListItemIcon>{{ getFileIcon(doc.file_type) }}</mat-icon>
                <div matListItemTitle>{{ doc.title }}</div>
                <div matListItemLine>
                  <span class="doc-meta">
                    {{ formatFileSize(doc.file_size) }}
                    <span class="status-chip" [ngClass]="doc.processing_status">
                      {{ getStatusLabel(doc.processing_status) }}
                    </span>
                    <span *ngIf="doc.extracted_text_length > 0">
                      {{ doc.extracted_text_length | number }} caractères
                    </span>
                  </span>
                </div>
                <button mat-icon-button matListItemMeta [matMenuTriggerFor]="docMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #docMenu="matMenu">
                  <button mat-menu-item (click)="reprocessDocument(doc)" 
                    *ngIf="doc.processing_status === 'failed'">
                    <mat-icon>refresh</mat-icon>
                    <span>Retraiter</span>
                  </button>
                  <button mat-menu-item (click)="deleteDocument(doc)" class="delete-btn">
                    <mat-icon>delete</mat-icon>
                    <span>Supprimer</span>
                  </button>
                </mat-menu>
              </mat-list-item>
            </mat-list>
            
            <div class="empty-state" *ngIf="!course.documents || course.documents.length === 0">
              <mat-icon>folder_open</mat-icon>
              <h3>Aucun document</h3>
              <p>Uploadez des documents pour générer des quiz</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      
      .back-btn {
        margin-right: 8px;
        vertical-align: middle;
      }
      
      h1 {
        display: inline;
      }
    }
    
    .upload-card {
      margin-bottom: 24px;
    }
    
    .upload-zone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover, &.dragover {
        border-color: #3f51b5;
        background-color: rgba(63, 81, 181, 0.05);
      }
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #999;
      }
      
      p {
        margin: 8px 0;
        color: #666;
      }
    }
    
    .doc-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #666;
      font-size: 14px;
    }
    
    .status-chip {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      
      &.completed {
        background-color: #e8f5e9;
        color: #2e7d32;
      }
      
      &.processing {
        background-color: #fff3e0;
        color: #ef6c00;
      }
      
      &.pending {
        background-color: #e3f2fd;
        color: #1565c0;
      }
      
      &.failed {
        background-color: #ffebee;
        color: #c62828;
      }
    }
    
    .delete-btn {
      color: #f44336;
    }
    
    mat-card {
      margin-bottom: 24px;
    }
  `]
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  loading = true;
  uploading = false;
  isDragging = false;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourse(id);
  }

  loadCourse(id: number): void {
    this.loading = true;
    this.courseService.getCourse(id).subscribe({
      next: (course) => {
        this.course = course;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get hasCompletedDocuments(): boolean {
    return this.course?.documents?.some(d => d.processing_status === 'completed') || false;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.uploadFiles(Array.from(files));
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.uploadFiles(Array.from(input.files));
    }
  }

  uploadFiles(files: File[]): void {
    if (!this.course) return;
    
    this.uploading = true;
    let completed = 0;
    
    for (const file of files) {
      this.courseService.uploadDocument(this.course.id, file).subscribe({
        next: (doc) => {
          if (this.course?.documents) {
            this.course.documents.push(doc);
          }
          completed++;
          if (completed === files.length) {
            this.uploading = false;
            this.snackBar.open(`${files.length} fichier(s) uploadé(s)`, 'Fermer', {
              duration: 3000,
              panelClass: 'success-snackbar',
            });
          }
        },
        error: () => {
          completed++;
          if (completed === files.length) {
            this.uploading = false;
          }
          this.snackBar.open(`Erreur lors de l'upload de ${file.name}`, 'Fermer', {
            duration: 5000,
            panelClass: 'error-snackbar',
          });
        },
      });
    }
  }

  getFileIcon(fileType: string): string {
    const icons: { [key: string]: string } = {
      pdf: 'picture_as_pdf',
      docx: 'description',
      txt: 'article',
      image: 'image',
    };
    return icons[fileType] || 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      processing: 'En cours',
      completed: 'Terminé',
      failed: 'Échec',
    };
    return labels[status] || status;
  }

  reprocessDocument(doc: Document): void {
    this.courseService.reprocessDocument(doc.id).subscribe({
      next: () => {
        doc.processing_status = 'processing';
        this.snackBar.open('Retraitement lancé', 'Fermer', { duration: 3000 });
      },
    });
  }

  deleteDocument(doc: Document): void {
    if (confirm(`Supprimer "${doc.title}" ?`)) {
      this.courseService.deleteDocument(doc.id).subscribe({
        next: () => {
          if (this.course?.documents) {
            this.course.documents = this.course.documents.filter(d => d.id !== doc.id);
          }
          this.snackBar.open('Document supprimé', 'Fermer', { duration: 3000 });
        },
      });
    }
  }
}
