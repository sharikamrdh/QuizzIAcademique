"""
Views for analytics and statistics.
"""

from datetime import timedelta

from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.quizzes.models import QuizAttempt, Question, UserAnswer
from apps.courses.models import CourseEnrollment
from apps.users.models import UserBadge


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard(request):
    """Get student dashboard data."""
    user = request.user
    
    # Quiz statistics
    attempts = QuizAttempt.objects.filter(
        student=user,
        status=QuizAttempt.Status.COMPLETED
    )
    
    total_quizzes = attempts.count()
    avg_score = attempts.aggregate(avg=Avg('score'))['avg'] or 0
    total_time = attempts.aggregate(total=Sum('time_spent'))['total'] or 0
    passed_quizzes = attempts.filter(score__gte=60).count()
    
    # Recent activity (last 7 days)
    week_ago = timezone.now() - timedelta(days=7)
    recent_attempts = attempts.filter(completed_at__gte=week_ago)
    
    daily_activity = recent_attempts.annotate(
        date=TruncDate('completed_at')
    ).values('date').annotate(
        count=Count('id'),
        avg_score=Avg('score')
    ).order_by('date')
    
    # Performance by difficulty
    by_difficulty = attempts.values('quiz__difficulty').annotate(
        count=Count('id'),
        avg_score=Avg('score')
    )
    
    # Performance by question type
    question_performance = []
    for q_type in ['qcm', 'vf', 'ouvert', 'completion']:
        answers = UserAnswer.objects.filter(
            attempt__student=user,
            question__question_type=q_type
        )
        total = answers.count()
        correct = answers.filter(is_correct=True).count()
        if total > 0:
            question_performance.append({
                'type': q_type,
                'total': total,
                'correct': correct,
                'accuracy': round(correct / total * 100, 1)
            })
    
    # Badges
    badges = UserBadge.objects.filter(user=user).select_related('badge')
    
    # Enrollments
    enrollments = CourseEnrollment.objects.filter(student=user).count()
    
    return Response({
        'summary': {
            'total_quizzes': total_quizzes,
            'passed_quizzes': passed_quizzes,
            'avg_score': round(avg_score, 1),
            'total_time_minutes': round(total_time / 60, 1) if total_time else 0,
            'total_points': user.total_points,
            'level': user.level,
            'enrollments': enrollments,
        },
        'daily_activity': list(daily_activity),
        'by_difficulty': list(by_difficulty),
        'question_performance': question_performance,
        'badges': [
            {
                'name': ub.badge.name,
                'icon': ub.badge.icon,
                'type': ub.badge.badge_type,
                'earned_at': ub.earned_at
            }
            for ub in badges
        ],
        'recent_quizzes': [
            {
                'quiz_title': a.quiz.title,
                'score': a.score,
                'completed_at': a.completed_at,
                'passed': a.is_passed
            }
            for a in attempts.order_by('-completed_at')[:5]
        ]
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def history(request):
    """Get quiz history with pagination."""
    user = request.user
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    
    attempts = QuizAttempt.objects.filter(
        student=user,
        status=QuizAttempt.Status.COMPLETED
    ).select_related('quiz', 'quiz__course').order_by('-completed_at')
    
    total = attempts.count()
    start = (page - 1) * page_size
    end = start + page_size
    
    results = [
        {
            'id': a.id,
            'quiz_id': a.quiz.id,
            'quiz_title': a.quiz.title,
            'course_title': a.quiz.course.title,
            'score': a.score,
            'correct_answers': a.correct_answers,
            'total_questions': a.total_questions,
            'time_spent': a.time_spent,
            'passed': a.is_passed,
            'completed_at': a.completed_at,
        }
        for a in attempts[start:end]
    ]
    
    return Response({
        'results': results,
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': (total + page_size - 1) // page_size
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def progress(request):
    """Get learning progress over time."""
    user = request.user
    days = int(request.query_params.get('days', 30))
    
    start_date = timezone.now() - timedelta(days=days)
    
    attempts = QuizAttempt.objects.filter(
        student=user,
        status=QuizAttempt.Status.COMPLETED,
        completed_at__gte=start_date
    ).annotate(
        date=TruncDate('completed_at')
    ).values('date').annotate(
        quizzes_completed=Count('id'),
        avg_score=Avg('score'),
        total_points=Sum('points_earned'),
        total_time=Sum('time_spent')
    ).order_by('date')
    
    # Calculate cumulative progress
    cumulative_points = 0
    cumulative_quizzes = 0
    progress_data = []
    
    for entry in attempts:
        cumulative_points += entry['total_points'] or 0
        cumulative_quizzes += entry['quizzes_completed']
        progress_data.append({
            'date': entry['date'],
            'quizzes_completed': entry['quizzes_completed'],
            'avg_score': round(entry['avg_score'] or 0, 1),
            'points_earned': entry['total_points'] or 0,
            'time_spent_minutes': round((entry['total_time'] or 0) / 60, 1),
            'cumulative_points': cumulative_points,
            'cumulative_quizzes': cumulative_quizzes,
        })
    
    return Response({
        'period_days': days,
        'progress': progress_data,
        'summary': {
            'total_quizzes': cumulative_quizzes,
            'total_points': cumulative_points,
        }
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def weak_areas(request):
    """Identify areas that need improvement."""
    user = request.user
    
    # Get all incorrect answers
    incorrect_answers = UserAnswer.objects.filter(
        attempt__student=user,
        is_correct=False
    ).select_related('question', 'question__quiz', 'question__quiz__course')
    
    # Group by course
    by_course = {}
    for answer in incorrect_answers:
        course_title = answer.question.quiz.course.title
        if course_title not in by_course:
            by_course[course_title] = {
                'total_incorrect': 0,
                'questions': []
            }
        by_course[course_title]['total_incorrect'] += 1
        if len(by_course[course_title]['questions']) < 5:
            by_course[course_title]['questions'].append({
                'question': answer.question.text[:100],
                'correct_answer': answer.question.correct_answer,
                'your_answer': answer.answer
            })
    
    # Sort by most incorrect
    weak_areas = [
        {'course': k, **v}
        for k, v in sorted(by_course.items(), key=lambda x: -x[1]['total_incorrect'])
    ]
    
    return Response({
        'weak_areas': weak_areas[:10],
        'recommendations': [
            f"Réviser le cours '{area['course']}' - {area['total_incorrect']} erreurs"
            for area in weak_areas[:3]
        ]
    })
