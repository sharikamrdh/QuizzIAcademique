"""
Models for Courses and Documents.
"""

from django.conf import settings
from django.db import models


class Course(models.Model):
    """
    Course model representing a learning module.
    """
    
    class Category(models.TextChoices):
        SCIENCE = 'science', 'Sciences'
        MATH = 'math', 'Mathématiques'
        HISTORY = 'history', 'Histoire'
        LANGUAGE = 'language', 'Langues'
        IT = 'it', 'Informatique'
        OTHER = 'other', 'Autre'
    
    title = models.CharField(max_length=255, verbose_name='Titre')
    description = models.TextField(blank=True, verbose_name='Description')
    category = models.CharField(
        max_length=50,
        choices=Category.choices,
        default=Category.OTHER,
        verbose_name='Catégorie'
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='courses',
        verbose_name='Propriétaire'
    )
    is_public = models.BooleanField(default=False, verbose_name='Public')
    thumbnail = models.ImageField(
        upload_to='course_thumbnails/',
        null=True,
        blank=True,
        verbose_name='Vignette'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Cours'
        verbose_name_plural = 'Cours'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def documents_count(self) -> int:
        return self.documents.count()
    
    @property
    def total_text_length(self) -> int:
        return sum(doc.extracted_text_length for doc in self.documents.all())


class Document(models.Model):
    """
    Document model for uploaded files.
    """
    
    class FileType(models.TextChoices):
        PDF = 'pdf', 'PDF'
        DOCX = 'docx', 'Word'
        TXT = 'txt', 'Texte'
        IMAGE = 'image', 'Image'
    
    class ProcessingStatus(models.TextChoices):
        PENDING = 'pending', 'En attente'
        PROCESSING = 'processing', 'En cours'
        COMPLETED = 'completed', 'Terminé'
        FAILED = 'failed', 'Échec'
    
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name='Cours'
    )
    title = models.CharField(max_length=255, verbose_name='Titre')
    file = models.FileField(upload_to='documents/', verbose_name='Fichier')
    file_type = models.CharField(
        max_length=20,
        choices=FileType.choices,
        verbose_name='Type de fichier'
    )
    file_size = models.IntegerField(default=0, verbose_name='Taille (octets)')
    extracted_text = models.TextField(blank=True, verbose_name='Texte extrait')
    processing_status = models.CharField(
        max_length=20,
        choices=ProcessingStatus.choices,
        default=ProcessingStatus.PENDING,
        verbose_name='Statut'
    )
    processing_error = models.TextField(blank=True, verbose_name='Erreur')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents',
        verbose_name='Uploadé par'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.course.title})"
    
    @property
    def extracted_text_length(self) -> int:
        return len(self.extracted_text) if self.extracted_text else 0
    
    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
            # Determine file type from extension
            ext = self.file.name.split('.')[-1].lower()
            if ext == 'pdf':
                self.file_type = self.FileType.PDF
            elif ext == 'docx':
                self.file_type = self.FileType.DOCX
            elif ext == 'txt':
                self.file_type = self.FileType.TXT
            elif ext in ['png', 'jpg', 'jpeg', 'gif']:
                self.file_type = self.FileType.IMAGE
        super().save(*args, **kwargs)


class CourseEnrollment(models.Model):
    """
    Enrollment relationship between students and courses.
    """
    
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress = models.FloatField(default=0.0, verbose_name='Progression (%)')
    
    class Meta:
        verbose_name = 'Inscription'
        verbose_name_plural = 'Inscriptions'
        unique_together = ['student', 'course']
    
    def __str__(self):
        return f"{self.student.username} - {self.course.title}"
