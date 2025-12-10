from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, ReminderViewSet, StudyPlanViewSet, StudySessionViewSet

router = DefaultRouter()
router.register('events', EventViewSet, basename='event')
router.register('reminders', ReminderViewSet, basename='reminder')
router.register('study-plans', StudyPlanViewSet, basename='studyplan')
router.register('study-sessions', StudySessionViewSet, basename='studysession')

urlpatterns = [
    path('', include(router.urls)),
]
