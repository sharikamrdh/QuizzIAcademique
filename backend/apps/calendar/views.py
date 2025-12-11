from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Event, Reminder, StudyPlan, StudySession
from .serializers import EventSerializer, ReminderSerializer, StudyPlanSerializer, StudySessionSerializer
from .revision_planner import RevisionPlanner  # Import du générateur de planning

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        # Plus besoin d'appeler RevisionPlanner ici pour un Event

class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(event__user=self.request.user)


class StudyPlanViewSet(viewsets.ModelViewSet):
    serializer_class = StudyPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # On crée d'abord le StudyPlan
        study_plan = serializer.save(user=self.request.user)
        # Puis on génère automatiquement le planning de révision
        RevisionPlanner.generate_plan(study_plan)


class StudySessionViewSet(viewsets.ModelViewSet):
    serializer_class = StudySessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudySession.objects.filter(study_plan__user=self.request.user)
