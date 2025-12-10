from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from .models import Badge, UserBadge
from .serializers import BadgeSerializer, UserBadgeSerializer, BadgeProgressSerializer


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API pour consulter les badges
    
    Endpoints disponibles:
    - GET /api/gamification/badges/ - Liste tous les badges actifs
    - GET /api/gamification/badges/{id}/ - Détails d'un badge
    - GET /api/gamification/badges/my_badges/ - Badges de l'utilisateur connecté
    - GET /api/gamification/badges/available/ - Badges non encore obtenus
    - GET /api/gamification/badges/statistics/ - Statistiques des badges
    """
    
    queryset = Badge.objects.filter(is_active=True)
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_badges(self, request):
        """
        Récupère tous les badges obtenus par l'utilisateur connecté
        """
        user_badges = UserBadge.objects.filter(
            user=request.user
        ).select_related('badge').order_by('-earned_at')
        
        serializer = UserBadgeSerializer(user_badges, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """
        Récupère les badges disponibles que l'utilisateur n'a pas encore obtenus
        """
        # IDs des badges déjà obtenus
        earned_badge_ids = UserBadge.objects.filter(
            user=request.user
        ).values_list('badge_id', flat=True)
        
        # Badges non encore obtenus
        available_badges = Badge.objects.filter(
            is_active=True
        ).exclude(id__in=earned_badge_ids)
        
        serializer = self.get_serializer(available_badges, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Statistiques globales des badges de l'utilisateur
        """
        user = request.user
        
        # Total de badges actifs
        total_badges = Badge.objects.filter(is_active=True).count()
        
        # Badges obtenus par l'utilisateur
        user_badges = UserBadge.objects.filter(user=user).select_related('badge')
        earned_count = user_badges.count()
        
        # Calcul du pourcentage de complétion
        completion_percentage = round((earned_count / total_badges * 100), 2) if total_badges > 0 else 0
        
        # Total de points
        points_total = sum(ub.badge.points for ub in user_badges)
        
        # Badges par rareté
        badges_by_rarity = user_badges.values('badge__rarity').annotate(
            count=Count('id')
        ).order_by('badge__rarity')
        
        rarity_dict = {item['badge__rarity']: item['count'] for item in badges_by_rarity}
        
        # Préparer les données
        stats = {
            'total_badges': total_badges,
            'earned_badges': earned_count,
            'completion_percentage': completion_percentage,
            'points_total': points_total,
            'badges_by_rarity': rarity_dict
        }
        
        serializer = BadgeProgressSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """
        Classement des utilisateurs par nombre de badges
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Top 10 utilisateurs avec le plus de badges
        top_users = User.objects.annotate(
            badge_count=Count('user_badges')
        ).order_by('-badge_count')[:10]
        
        leaderboard = [
            {
                'rank': idx + 1,
                'username': user.username,
                'badge_count': user.badge_count,
                'points': sum(
                    ub.badge.points for ub in UserBadge.objects.filter(user=user).select_related('badge')
                )
            }
            for idx, user in enumerate(top_users)
        ]
        
        return Response(leaderboard)
