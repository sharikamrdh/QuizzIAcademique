from django.db import models
from apps.users.models import User
from apps.courses.models import Course


class Event(models.Model):
    """Événement dans le calendrier"""
    EVENT_TYPES = [
        ('exam', 'Examen'),
        ('revision', 'Révision'),
        ('td', 'TD'),
        ('course', 'Cours'),
        ('reminder', 'Rappel'),
        ('other', 'Autre'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calendar_events')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='other')
    
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    all_day = models.BooleanField(default=False)
    
    location = models.CharField(max_length=200, blank=True)
    color = models.CharField(max_length=7, default='#3498db')  # Couleur hex
    
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Événement'
        verbose_name_plural = 'Événements'
    
    def __str__(self):
        return f"{self.title} - {self.start_date.strftime('%d/%m/%Y')}"


class Reminder(models.Model):
    """Rappel pour un événement"""
    REMINDER_TYPES = [
        ('notification', 'Notification'),
        ('email', 'Email'),
        ('both', 'Les deux'),
    ]
    
    REMINDER_TIMING = [
        ('1h', '1 heure avant'),
        ('3h', '3 heures avant'),
        ('1d', '1 jour avant'),
        ('3d', '3 jours avant'),
        ('1w', '1 semaine avant'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='reminders')
    reminder_type = models.CharField(max_length=20, choices=REMINDER_TYPES, default='notification')
    timing = models.CharField(max_length=10, choices=REMINDER_TIMING, default='1d')
    
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Rappel'
        verbose_name_plural = 'Rappels'
    
    def __str__(self):
        return f"Rappel {self.timing} pour {self.event.title}"


class StudyPlan(models.Model):
    """Planning de révision généré automatiquement"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_plans')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='study_plans')
    
    exam_date = models.DateField()
    start_date = models.DateField()
    
    hours_per_day = models.FloatField(default=2.0)
    priority_level = models.IntegerField(default=5, choices=[(i, i) for i in range(1, 11)])
    
    is_active = models.BooleanField(default=True)
    is_completed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Planning de révision'
        verbose_name_plural = 'Plannings de révision'
        ordering = ['-exam_date']
    
    def __str__(self):
        return f"Planning {self.course.title} - Examen le {self.exam_date}"


class StudySession(models.Model):
    """Session de révision dans un planning"""
    study_plan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='sessions')
    
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    topic = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    actual_duration_minutes = models.IntegerField(null=True, blank=True)
    difficulty_rating = models.IntegerField(null=True, blank=True, choices=[(i, i) for i in range(1, 6)])
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Session de révision'
        verbose_name_plural = 'Sessions de révision'
        ordering = ['date', 'start_time']
    
    def __str__(self):
        return f"{self.topic} - {self.date}"
