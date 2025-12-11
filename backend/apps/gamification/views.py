from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.contrib.auth import get_user_model

from .models import Badge, UserBadge
from .serializers import (
    BadgeSerializer,
    UserBadgeSerializer,
)


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoints disponibles :
    - GET /api/gamification/badges/
    - GET /api/gamification/badges/{id}/
    - GET /api/gamification/badges/my_badges/
    - GET /api/gamification/badges/available/
    - GET /api/gamification/badges/statistics/
    - GET /api/gamification/badges/leaderboard/
    """

    queryset = Badge.objects.filter(is_active=True)
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]

    # ------------------------------------------------------------
    # GET /api/gamification/badges/my_badges/
    # ------------------------------------------------------------
    @action(detail=False, methods=['get'])
    def my_badges(self, request):
        user_badges = UserBadge.objects.filter(
            user=request.user
        ).select_related('badge').order_by('-earned_at')

        serializer = UserBadgeSerializer(user_badges, many=True)
        return Response(serializer.data)

    # ------------------------------------------------------------
    # GET /api/gamification/badges/available/
    # ------------------------------------------------------------
    @action(detail=False, methods=['get'])
    def available(self, request):
        earned_ids = UserBadge.objects.filter(
            user=request.user
        ).values_list('badge_id', flat=True)

        available_badges = Badge.objects.filter(
            is_active=True
        ).exclude(id__in=earned_ids)

        serializer = self.get_serializer(available_badges, many=True)
        return Response(serializer.data)

    # ------------------------------------------------------------
    # GET /api/gamification/badges/statistics/
    # ------------------------------------------------------------
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        user = request.user

        total_badges = Badge.objects.filter(is_active=True).count()
        user_badges = UserBadge.objects.filter(user=user).select_related("badge")

        earned_count = user_badges.count()
        completion_percentage = round((earned_count / total_badges * 100), 2) if total_badges > 0 else 0
        points_total = sum(ub.badge.points for ub in user_badges)

        badges_by_rarity = {
            item["badge__rarity"]: item["count"]
            for item in user_badges.values("badge__rarity").annotate(count=Count("id"))
        }

        stats = {
            "total_badges": total_badges,
            "earned_badges": earned_count,
            "completion_percentage": completion_percentage,
            "points_total": points_total,
            "badges_by_rarity": badges_by_rarity,
        }

        return Response(stats)

    # ------------------------------------------------------------
    # GET /api/gamification/badges/leaderboard/
    # ------------------------------------------------------------
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        User = get_user_model()

        top_users = User.objects.annotate(
            badge_count=Count("userbadges")
        ).order_by("-badge_count")[:10]

        leaderboard = []

        for rank, user in enumerate(top_users, start=1):
            points = sum(
                ub.badge.points
                for ub in UserBadge.objects.filter(user=user).select_related("badge")
            )
            leaderboard.append({
                "rank": rank,
                "username": user.username,
                "badge_count": user.badge_count,
                "points": points
            })

        return Response(leaderboard)
