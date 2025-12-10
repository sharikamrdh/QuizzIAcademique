from django.db import models
from django.conf import settings
from django.utils import timezone


class Badge(models.Model):
    """Définition des badges disponibles dans le système"""
    
    TYPE_CHOICES = [
        ('performance', 'Performance'),
        ('streak', 'Série'),
        ('completion', 'Complétion'),
        ('mastery', 'Maîtrise'),
    ]
    
    RARITY_CHOICES = [
        ('common', 'Commun'),
        ('rare', 'Rare'),
        ('epic', 'Épique'),
        ('legendary', 'Légendaire'),
    ]
    
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom du badge")
    description = models.TextField(verbose_name="Description")
    icon = models.CharField(max_length=50, verbose_name="Icône", help_text="Emoji ou nom d'icône")
    badge_type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="Type")
    criteria = models.JSONField(verbose_name="Critères", help_text="Règles d'attribution en JSON")
    points = models.IntegerField(default=10, verbose_name="Points")
    rarity = models.CharField(max_length=20, choices=RARITY_CHOICES, default='common', verbose_name="Rareté")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    
    class Meta:
        ordering = ['-rarity', 'name']
        verbose_name = 'Badge'
        verbose_name_plural = 'Badges'
        db_table = 'gamification_badge'
    
    def __str__(self):
        return f"{self.icon} {self.name}"


class UserBadge(models.Model):
    """Badges obtenus par les utilisateurs"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='user_badges',
        verbose_name="Utilisateur"
    )
    badge = models.ForeignKey(
        Badge, 
        on_delete=models.CASCADE,
        verbose_name="Badge"
    )
    earned_at = models.DateTimeField(default=timezone.now, verbose_name="Obtenu le")
    progress = models.IntegerField(default=100, verbose_name="Progression", help_text="Pourcentage 0-100")
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Métadonnées", help_text="Données contextuelles")
    
    class Meta:
        unique_together = ('user', 'badge')
        ordering = ['-earned_at']
        verbose_name = 'Badge utilisateur'
        verbose_name_plural = 'Badges utilisateurs'
        db_table = 'gamification_user_badge'
    
    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"
