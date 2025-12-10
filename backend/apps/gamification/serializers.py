from rest_framework import serializers
from .models import Badge, UserBadge


class BadgeSerializer(serializers.ModelSerializer):
    """Serializer pour les badges"""
    
    class Meta:
        model = Badge
        fields = [
            'id', 
            'name', 
            'description', 
            'icon', 
            'badge_type', 
            'criteria',
            'points', 
            'rarity', 
            'is_active',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer pour les badges obtenus par un utilisateur"""
    
    badge = BadgeSerializer(read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserBadge
        fields = [
            'id',
            'user_username',
            'badge',
            'earned_at',
            'progress',
            'metadata'
        ]
        read_only_fields = ['id', 'earned_at']


class BadgeProgressSerializer(serializers.Serializer):
    """Serializer pour la progression des badges"""
    
    total_badges = serializers.IntegerField()
    earned_badges = serializers.IntegerField()
    completion_percentage = serializers.FloatField()
    points_total = serializers.IntegerField()
    badges_by_rarity = serializers.DictField()
