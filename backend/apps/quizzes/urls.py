"""
URL patterns for quizzes app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'attempts', views.QuizAttemptViewSet, basename='attempt')
router.register(r'', views.QuizViewSet, basename='quiz')

urlpatterns = [
    path('my-attempts/', views.MyQuizAttemptsView.as_view(), name='my_attempts'),
    path('', include(router.urls)),
]
