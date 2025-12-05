"""
URL patterns for analytics app.
"""

from django.urls import path

from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('history/', views.history, name='history'),
    path('progress/', views.progress, name='progress'),
    path('weak-areas/', views.weak_areas, name='weak_areas'),
]
