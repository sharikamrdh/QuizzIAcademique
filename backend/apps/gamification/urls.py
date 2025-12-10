from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BadgeViewSet

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'badges', BadgeViewSet, basename='badge')

# URLs de l'application gamification
urlpatterns = [
    path('', include(router.urls)),
]
