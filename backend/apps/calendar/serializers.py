from rest_framework import serializers
from .models import Event, Reminder, StudyPlan, StudySession


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        exclude = ['user']
        read_only_fields = ['created_at', 'updated_at', 'completed_at']
        extra_kwargs = {
            'end_date': {'required': False, 'allow_null': True},
            'description': {'required': False, 'allow_blank': True},
            'location': {'required': False, 'allow_blank': True},
            'course': {'required': False, 'allow_null': True},
        }


class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = '__all__'
        read_only_fields = ['is_sent', 'sent_at', 'created_at']


class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = '__all__'
        read_only_fields = ['created_at']


class StudyPlanSerializer(serializers.ModelSerializer):
    sessions = StudySessionSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudyPlan
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']
