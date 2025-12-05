"""
Admin configuration for quizzes app.
"""

from django.contrib import admin

from .models import Quiz, Question, QuizAttempt, UserAnswer, Flashcard


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    readonly_fields = ['question_type']


class FlashcardInline(admin.TabularInline):
    model = Flashcard
    extra = 0


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'difficulty', 'status', 'questions_count', 'created_by', 'created_at']
    list_filter = ['status', 'difficulty', 'created_at']
    search_fields = ['title', 'course__title', 'created_by__username']
    inlines = [QuestionInline, FlashcardInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['text_preview', 'quiz', 'question_type', 'points', 'order']
    list_filter = ['question_type', 'quiz']
    search_fields = ['text', 'quiz__title']
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Question'


class UserAnswerInline(admin.TabularInline):
    model = UserAnswer
    extra = 0
    readonly_fields = ['question', 'answer', 'is_correct', 'points_earned']


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['student', 'quiz', 'status', 'score', 'correct_answers', 'started_at', 'completed_at']
    list_filter = ['status', 'started_at']
    search_fields = ['student__username', 'quiz__title']
    inlines = [UserAnswerInline]


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ['front_preview', 'quiz', 'order']
    list_filter = ['quiz']
    search_fields = ['front', 'back']
    
    def front_preview(self, obj):
        return obj.front[:50] + '...' if len(obj.front) > 50 else obj.front
    front_preview.short_description = 'Recto'
