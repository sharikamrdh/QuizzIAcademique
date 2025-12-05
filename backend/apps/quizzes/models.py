"""
Models for Quiz and Questions.
"""

from django.conf import settings
from django.db import models

from apps.courses.models import Course, Document


class Quiz(models.Model):
    """
    Quiz model containing questions generated from documents.
    """
    
    class Difficulty(models.TextChoices):
        BEGINNER = 'debutant', 'Débutant'
        INTERMEDIATE = 'intermediaire', 'Intermédiaire'
        ADVANCED = 'avance', 'Avancé'
    
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Brouillon'
        PUBLISHED = 'published', 'Publié'
        ARCHIVED = 'archived', 'Archivé'
    
    title = models.CharField(max_length=255, verbose_name='Titre')
    description = models.TextField(blank=True, verbose_name='Description')
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='quizzes',
        verbose_name='Cours'
    )
    documents = models.ManyToManyField(
        Document,
        related_name='quizzes',
        verbose_name='Documents sources'
    )
    difficulty = models.CharField(
        max_length=20,
        choices=Difficulty.choices,
        default=Difficulty.INTERMEDIATE,
        verbose_name='Difficulté'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        verbose_name='Statut'
    )
    time_limit = models.IntegerField(
        default=30,
        verbose_name='Temps limite (minutes)',
        help_text='0 pour illimité'
    )
    passing_score = models.IntegerField(
        default=60,
        verbose_name='Score de réussite (%)'
    )
    shuffle_questions = models.BooleanField(
        default=True,
        verbose_name='Mélanger les questions'
    )
    show_correct_answers = models.BooleanField(
        default=True,
        verbose_name='Afficher les corrections'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_quizzes',
        verbose_name='Créé par'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quiz'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.course.title})"
    
    @property
    def questions_count(self) -> int:
        return self.questions.count()
    
    @property
    def total_points(self) -> int:
        return sum(q.points for q in self.questions.all())


class Question(models.Model):
    """
    Question model for quiz questions.
    """
    
    class QuestionType(models.TextChoices):
        QCM = 'qcm', 'QCM'
        TRUE_FALSE = 'vf', 'Vrai/Faux'
        OPEN = 'ouvert', 'Question ouverte'
        COMPLETION = 'completion', 'Complétion'
    
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions',
        verbose_name='Quiz'
    )
    question_type = models.CharField(
        max_length=20,
        choices=QuestionType.choices,
        verbose_name='Type de question'
    )
    text = models.TextField(verbose_name='Énoncé')
    choices = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Choix de réponses',
        help_text='Liste des choix pour QCM'
    )
    correct_answer = models.TextField(verbose_name='Réponse correcte')
    explanation = models.TextField(blank=True, verbose_name='Explication')
    points = models.IntegerField(default=1, verbose_name='Points')
    order = models.IntegerField(default=0, verbose_name='Ordre')
    
    class Meta:
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'
        ordering = ['order']
    
    def __str__(self):
        return f"Q{self.order}: {self.text[:50]}..."
    
    def check_answer(self, user_answer: str) -> bool:
        """Check if the user's answer is correct."""
        if self.question_type == self.QuestionType.OPEN:
            # For open questions, we do a simple comparison
            # In production, you might want AI-assisted grading
            return user_answer.lower().strip() == self.correct_answer.lower().strip()
        elif self.question_type == self.QuestionType.COMPLETION:
            # Case-insensitive comparison for completion
            return user_answer.lower().strip() == self.correct_answer.lower().strip()
        else:
            # QCM and True/False - exact match
            return user_answer == self.correct_answer


class QuizAttempt(models.Model):
    """
    Model for tracking quiz attempts by users.
    """
    
    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'En cours'
        COMPLETED = 'completed', 'Terminé'
        ABANDONED = 'abandoned', 'Abandonné'
    
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='attempts',
        verbose_name='Quiz'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quiz_attempts',
        verbose_name='Étudiant'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_PROGRESS,
        verbose_name='Statut'
    )
    score = models.FloatField(default=0, verbose_name='Score (%)')
    points_earned = models.IntegerField(default=0, verbose_name='Points gagnés')
    total_points = models.IntegerField(default=0, verbose_name='Points totaux')
    correct_answers = models.IntegerField(default=0, verbose_name='Bonnes réponses')
    total_questions = models.IntegerField(default=0, verbose_name='Total questions')
    time_spent = models.IntegerField(default=0, verbose_name='Temps passé (sec)')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Tentative de quiz'
        verbose_name_plural = 'Tentatives de quiz'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.student.username} - {self.quiz.title} ({self.score}%)"
    
    @property
    def is_passed(self) -> bool:
        return self.score >= self.quiz.passing_score


class UserAnswer(models.Model):
    """
    Model for storing user answers to questions.
    """
    
    attempt = models.ForeignKey(
        QuizAttempt,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name='Tentative'
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='user_answers',
        verbose_name='Question'
    )
    answer = models.TextField(verbose_name='Réponse')
    is_correct = models.BooleanField(default=False, verbose_name='Correct')
    points_earned = models.IntegerField(default=0, verbose_name='Points gagnés')
    answered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Réponse utilisateur'
        verbose_name_plural = 'Réponses utilisateurs'
        unique_together = ['attempt', 'question']
    
    def __str__(self):
        status = '✓' if self.is_correct else '✗'
        return f"{status} {self.question.text[:30]}..."
    
    def save(self, *args, **kwargs):
        # Auto-check answer and assign points
        self.is_correct = self.question.check_answer(self.answer)
        self.points_earned = self.question.points if self.is_correct else 0
        super().save(*args, **kwargs)


class Flashcard(models.Model):
    """
    Flashcard model for revision mode.
    """
    
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='flashcards',
        verbose_name='Quiz'
    )
    front = models.TextField(verbose_name='Recto (question)')
    back = models.TextField(verbose_name='Verso (réponse)')
    hint = models.TextField(blank=True, verbose_name='Indice')
    order = models.IntegerField(default=0, verbose_name='Ordre')
    
    class Meta:
        verbose_name = 'Flashcard'
        verbose_name_plural = 'Flashcards'
        ordering = ['order']
    
    def __str__(self):
        return f"Flashcard: {self.front[:50]}..."
