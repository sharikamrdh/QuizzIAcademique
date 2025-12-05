"""
User models for Quiz Generator application.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model with additional fields for the quiz application.
    """
    
    class Role(models.TextChoices):
        STUDENT = 'student', 'Étudiant'
        TEACHER = 'teacher', 'Enseignant'
        ADMIN = 'admin', 'Administrateur'
    
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
        verbose_name='Rôle'
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        verbose_name='Photo de profil'
    )
    bio = models.TextField(
        blank=True,
        verbose_name='Biographie'
    )
    institution = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Institution'
    )
    total_points = models.IntegerField(
        default=0,
        verbose_name='Points totaux'
    )
    level = models.IntegerField(
        default=1,
        verbose_name='Niveau'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.email})"
    
    def add_points(self, points: int) -> None:
        """Add points and update level."""
        self.total_points += points
        self.level = (self.total_points // 100) + 1
        self.save(update_fields=['total_points', 'level'])
    
    @property
    def is_student(self) -> bool:
        return self.role == self.Role.STUDENT
    
    @property
    def is_teacher(self) -> bool:
        return self.role == self.Role.TEACHER


class Badge(models.Model):
    """
    Badge model for gamification.
    """
    
    class BadgeType(models.TextChoices):
        BRONZE = 'bronze', 'Bronze'
        SILVER = 'silver', 'Argent'
        GOLD = 'gold', 'Or'
        PLATINUM = 'platinum', 'Platine'
    
    name = models.CharField(max_length=100, verbose_name='Nom')
    description = models.TextField(verbose_name='Description')
    icon = models.CharField(max_length=50, verbose_name='Icône')
    badge_type = models.CharField(
        max_length=20,
        choices=BadgeType.choices,
        default=BadgeType.BRONZE
    )
    points_required = models.IntegerField(default=0, verbose_name='Points requis')
    quizzes_required = models.IntegerField(default=0, verbose_name='Quiz requis')
    
    class Meta:
        verbose_name = 'Badge'
        verbose_name_plural = 'Badges'
    
    def __str__(self):
        return self.name


class UserBadge(models.Model):
    """
    Association between User and Badge.
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='badges'
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name='users'
    )
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Badge utilisateur'
        verbose_name_plural = 'Badges utilisateurs'
        unique_together = ['user', 'badge']
    
    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"
