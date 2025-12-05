"""
Serializers for Quiz models.
"""

from rest_framework import serializers

from .models import Quiz, Question, QuizAttempt, UserAnswer, Flashcard


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for Question model."""
    
    class Meta:
        model = Question
        fields = [
            'id', 'question_type', 'text', 'choices',
            'points', 'order'
        ]


class QuestionWithAnswerSerializer(QuestionSerializer):
    """Serializer including correct answer (for corrections)."""
    
    class Meta(QuestionSerializer.Meta):
        fields = QuestionSerializer.Meta.fields + ['correct_answer', 'explanation']


class QuizSerializer(serializers.ModelSerializer):
    """Serializer for Quiz model."""
    
    course_title = serializers.CharField(source='course.title', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    questions_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'course', 'course_title',
            'difficulty', 'status', 'time_limit', 'passing_score',
            'shuffle_questions', 'show_correct_answers',
            'questions_count', 'total_points',
            'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class QuizDetailSerializer(QuizSerializer):
    """Detailed serializer including questions."""
    
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta(QuizSerializer.Meta):
        fields = QuizSerializer.Meta.fields + ['questions']


class QuizWithAnswersSerializer(QuizSerializer):
    """Serializer with answers for correction view."""
    
    questions = QuestionWithAnswerSerializer(many=True, read_only=True)
    
    class Meta(QuizSerializer.Meta):
        fields = QuizSerializer.Meta.fields + ['questions']


class QuizGenerateSerializer(serializers.Serializer):
    """Serializer for quiz generation request."""
    
    course_id = serializers.IntegerField()
    document_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True
    )
    title = serializers.CharField(max_length=255, required=False)
    nb_questions = serializers.IntegerField(min_value=1, max_value=50, default=10)
    difficulty = serializers.ChoiceField(
        choices=['debutant', 'intermediaire', 'avance'],
        default='intermediaire'
    )
    question_types = serializers.ListField(
        child=serializers.ChoiceField(choices=['qcm', 'vf', 'ouvert', 'completion']),
        default=['qcm', 'vf']
    )
    time_limit = serializers.IntegerField(min_value=0, max_value=180, default=30)


class UserAnswerSerializer(serializers.ModelSerializer):
    """Serializer for UserAnswer model."""
    
    question_text = serializers.CharField(source='question.text', read_only=True)
    correct_answer = serializers.CharField(source='question.correct_answer', read_only=True)
    explanation = serializers.CharField(source='question.explanation', read_only=True)
    
    class Meta:
        model = UserAnswer
        fields = [
            'id', 'question', 'question_text', 'answer',
            'is_correct', 'points_earned', 'correct_answer', 'explanation'
        ]
        read_only_fields = ['id', 'is_correct', 'points_earned']


class QuizAttemptSerializer(serializers.ModelSerializer):
    """Serializer for QuizAttempt model."""
    
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    is_passed = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'quiz_title', 'status',
            'score', 'points_earned', 'total_points',
            'correct_answers', 'total_questions',
            'time_spent', 'is_passed',
            'started_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'score', 'points_earned', 'total_points',
            'correct_answers', 'total_questions',
            'started_at', 'completed_at'
        ]


class QuizAttemptDetailSerializer(QuizAttemptSerializer):
    """Detailed serializer including answers."""
    
    answers = UserAnswerSerializer(many=True, read_only=True)
    quiz = QuizWithAnswersSerializer(read_only=True)
    
    class Meta(QuizAttemptSerializer.Meta):
        fields = QuizAttemptSerializer.Meta.fields + ['answers']


class QuizSubmitSerializer(serializers.Serializer):
    """Serializer for submitting quiz answers."""
    
    answers = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
    time_spent = serializers.IntegerField(min_value=0)
    
    def validate_answers(self, value):
        for answer in value:
            if 'question_id' not in answer or 'answer' not in answer:
                raise serializers.ValidationError(
                    'Chaque réponse doit contenir question_id et answer.'
                )
        return value


class FlashcardSerializer(serializers.ModelSerializer):
    """Serializer for Flashcard model."""
    
    class Meta:
        model = Flashcard
        fields = ['id', 'front', 'back', 'hint', 'order']
