from django.contrib import admin
from .models import Event, Reminder, StudyPlan, StudySession


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'event_type', 'start_date', 'is_completed']
    list_filter = ['event_type', 'is_completed', 'all_day']
    search_fields = ['title', 'description', 'user__email']
    date_hierarchy = 'start_date'
    ordering = ['-start_date']


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ['event', 'reminder_type', 'timing', 'is_sent', 'sent_at']
    list_filter = ['reminder_type', 'timing', 'is_sent']
    search_fields = ['event__title']
    ordering = ['-created_at']


@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = ['course', 'user', 'exam_date', 'hours_per_day', 'is_active', 'is_completed']
    list_filter = ['is_active', 'is_completed', 'priority_level']
    search_fields = ['course__title', 'user__email']
    date_hierarchy = 'exam_date'
    ordering = ['-exam_date']


@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ['topic', 'study_plan', 'date', 'start_time', 'is_completed', 'difficulty_rating']
    list_filter = ['is_completed', 'difficulty_rating']
    search_fields = ['topic', 'description']
    date_hierarchy = 'date'
    ordering = ['date', 'start_time']
