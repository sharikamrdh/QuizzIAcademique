"""
Views for Quiz management and generation.
"""

from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
import random

from apps.courses.models import Course, Document
from .models import Quiz, Question, QuizAttempt, UserAnswer, Flashcard
from .serializers import (
    QuizSerializer,
    QuizDetailSerializer,
    QuizWithAnswersSerializer,
    QuizGenerateSerializer,
    QuestionSerializer,
    QuizAttemptSerializer,
    QuizAttemptDetailSerializer,
    QuizSubmitSerializer,
    FlashcardSerializer,
)
from services.ollama_client import OllamaClient


class QuizViewSet(ModelViewSet):
    """ViewSet for Quiz CRUD operations."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Quiz.objects.filter(
            Q(created_by=user) | Q(course__is_public=True, status=Quiz.Status.PUBLISHED)
        ).select_related('course', 'created_by').prefetch_related('questions')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuizDetailSerializer
        return QuizSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['post'], url_path='generate')
    def generate_quiz(self, request):
        """Generate quiz using AI (Ollama)."""
        serializer = QuizGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        # Get course and documents
        try:
            course = Course.objects.get(id=data['course_id'])
        except Course.DoesNotExist:
            return Response(
                {'error': 'Cours introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission
        if course.owner != request.user and not course.is_public:
            return Response(
                {'error': 'Accès non autorisé à ce cours.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get documents
        document_ids = data.get('document_ids', [])
        if document_ids:
            documents = Document.objects.filter(
                id__in=document_ids,
                course=course,
                processing_status=Document.ProcessingStatus.COMPLETED
            )
        else:
            documents = course.documents.filter(
                processing_status=Document.ProcessingStatus.COMPLETED
            )
        
        if not documents.exists():
            return Response(
                {'error': 'Aucun document traité disponible pour ce cours.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Combine text from documents
        combined_text = "\n\n".join([doc.extracted_text for doc in documents])
        
        if len(combined_text) < 100:
            return Response(
                {'error': 'Le texte extrait est trop court pour générer un quiz.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Call Ollama to generate questions
        ollama_client = OllamaClient()
        try:
            generated_questions = ollama_client.generate_questions(
                text=combined_text,
                nb_questions=data['nb_questions'],
                difficulty=data['difficulty'],
                question_types=data['question_types']
            )
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la génération IA: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        if not generated_questions:
            return Response(
                {'error': "L'IA n'a pas pu générer de questions."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create quiz
        title = data.get('title') or f"Quiz - {course.title}"
        quiz = Quiz.objects.create(
            title=title,
            course=course,
            difficulty=data['difficulty'],
            time_limit=data['time_limit'],
            created_by=request.user,
            status=Quiz.Status.DRAFT
        )
        quiz.documents.set(documents)
        
        # Create questions
        for i, q_data in enumerate(generated_questions):
            Question.objects.create(
                quiz=quiz,
                question_type=q_data.get('type', 'qcm'),
                text=q_data.get('question', ''),
                choices=q_data.get('choices', []),
                correct_answer=q_data.get('answer', ''),
                explanation=q_data.get('explanation', ''),
                order=i + 1
            )
        
        # Generate flashcards from questions
        for i, q_data in enumerate(generated_questions):
            Flashcard.objects.create(
                quiz=quiz,
                front=q_data.get('question', ''),
                back=q_data.get('answer', ''),
                hint=q_data.get('explanation', '')[:100] if q_data.get('explanation') else '',
                order=i + 1
            )
        
        return Response(
            QuizDetailSerializer(quiz).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'], url_path='start')
    def start_attempt(self, request, pk=None):
        """Start a new quiz attempt."""
        quiz = self.get_object()
        
        # Check if there's an ongoing attempt
        ongoing = QuizAttempt.objects.filter(
            quiz=quiz,
            student=request.user,
            status=QuizAttempt.Status.IN_PROGRESS
        ).first()
        
        if ongoing:
            return Response(
                QuizAttemptSerializer(ongoing).data,
                status=status.HTTP_200_OK
            )
        
        # Create new attempt
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            student=request.user,
            total_questions=quiz.questions_count,
            total_points=quiz.total_points
        )
        
        # Prepare questions (shuffle if enabled)
        questions = list(quiz.questions.all())
        if quiz.shuffle_questions:
            random.shuffle(questions)
        
        return Response({
            'attempt': QuizAttemptSerializer(attempt).data,
            'questions': QuestionSerializer(questions, many=True).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], url_path='submit')
    def submit_attempt(self, request, pk=None):
        """Submit quiz answers."""
        quiz = self.get_object()
        
        serializer = QuizSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        # Get ongoing attempt
        attempt = QuizAttempt.objects.filter(
            quiz=quiz,
            student=request.user,
            status=QuizAttempt.Status.IN_PROGRESS
        ).first()
        
        if not attempt:
            return Response(
                {'error': 'Aucune tentative en cours trouvée.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save answers
        correct_count = 0
        points_earned = 0
        
        for answer_data in data['answers']:
            question_id = answer_data['question_id']
            answer_text = answer_data['answer']
            
            try:
                question = quiz.questions.get(id=question_id)
            except Question.DoesNotExist:
                continue
            
            user_answer, _ = UserAnswer.objects.update_or_create(
                attempt=attempt,
                question=question,
                defaults={'answer': answer_text}
            )
            
            if user_answer.is_correct:
                correct_count += 1
                points_earned += user_answer.points_earned
        
        # Update attempt
        attempt.correct_answers = correct_count
        attempt.points_earned = points_earned
        attempt.time_spent = data['time_spent']
        attempt.score = (correct_count / attempt.total_questions * 100) if attempt.total_questions > 0 else 0
        attempt.status = QuizAttempt.Status.COMPLETED
        attempt.completed_at = timezone.now()
        attempt.save()
        
        # Update user points
        if attempt.is_passed:
            request.user.add_points(points_earned)
        
        return Response(
            QuizAttemptDetailSerializer(attempt).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'], url_path='flashcards')
    def get_flashcards(self, request, pk=None):
        """Get flashcards for revision mode."""
        quiz = self.get_object()
        flashcards = quiz.flashcards.all()
        return Response(FlashcardSerializer(flashcards, many=True).data)
    
    @action(detail=True, methods=['post'], url_path='publish')
    def publish(self, request, pk=None):
        """Publish a quiz."""
        quiz = self.get_object()
        
        if quiz.created_by != request.user:
            return Response(
                {'error': 'Non autorisé.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        quiz.status = Quiz.Status.PUBLISHED
        quiz.save()
        return Response({'message': 'Quiz publié avec succès.'})


class QuizAttemptViewSet(ModelViewSet):
    """ViewSet for quiz attempts."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = QuizAttemptSerializer
    http_method_names = ['get', 'head']
    
    def get_queryset(self):
        return QuizAttempt.objects.filter(
            student=self.request.user
        ).select_related('quiz', 'quiz__course')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuizAttemptDetailSerializer
        return QuizAttemptSerializer


class MyQuizAttemptsView(generics.ListAPIView):
    """List user's quiz attempts."""
    
    serializer_class = QuizAttemptSerializer
    
    def get_queryset(self):
        return QuizAttempt.objects.filter(
            student=self.request.user,
            status=QuizAttempt.Status.COMPLETED
        ).select_related('quiz').order_by('-completed_at')
