"""
URL patterns for courses app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'', views.CourseViewSet, basename='course')
router.register(r'documents', views.DocumentViewSet, basename='document')

urlpatterns = [
    path('my-enrollments/', views.MyEnrollmentsView.as_view(), name='my_enrollments'),
    path('', include(router.urls)),
]
