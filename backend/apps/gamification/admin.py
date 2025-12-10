from django.contrib import admin
from .models import Badge, UserBadge


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    """Interface d'administration pour les badges"""
    
    list_display = ['icon', 'name', 'badge_type', 'rarity', 'points', 'is_active', 'created_at']
    list_filter = ['badge_type', 'rarity', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    list_editable = ['is_active']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'description', 'icon')
        }),
        ('Configuration', {
            'fields': ('badge_type', 'rarity', 'points', 'criteria')
        }),
        ('Statut', {
            'fields': ('is_active', 'created_at')
        }),
    )
    
    def get_queryset(self, request):
        """Optimiser les requêtes"""
        qs = super().get_queryset(request)
        return qs.select_related()


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    """Interface d'administration pour les badges utilisateurs"""
    
    list_display = ['user', 'badge_icon', 'badge_name', 'earned_at', 'progress']
    list_filter = ['earned_at', 'badge__rarity', 'badge__badge_type']
    search_fields = ['user__username', 'badge__name']
    date_hierarchy = 'earned_at'
    readonly_fields = ['earned_at']
    autocomplete_fields = ['user', 'badge']
    
    fieldsets = (
        ('Attribution', {
            'fields': ('user', 'badge', 'earned_at')
        }),
        ('Progression', {
            'fields': ('progress', 'metadata')
        }),
    )
    
    def badge_icon(self, obj):
        """Afficher l'icône du badge"""
        return obj.badge.icon
    badge_icon.short_description = 'Icône'
    
    def badge_name(self, obj):
        """Afficher le nom du badge"""
        return obj.badge.name
    badge_name.short_description = 'Badge'
    
    def get_queryset(self, request):
        """Optimiser les requêtes"""
        qs = super().get_queryset(request)
        return qs.select_related('user', 'badge')
