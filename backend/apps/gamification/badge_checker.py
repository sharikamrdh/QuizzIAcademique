"""
Badge checker - Vérification automatique des badges
"""
from .models import Badge, UserBadge


class BadgeChecker:
    """Classe pour vérifier et attribuer automatiquement les badges"""
    
    @staticmethod
    def check_badges_for_user(user):
        """Vérifie tous les badges pour un utilisateur"""
        badges = Badge.objects.filter(is_active=True)
        
        for badge in badges:
            BadgeChecker.check_badge(user, badge)
    
    @staticmethod
    def check_badge(user, badge):
        """Vérifie si un utilisateur mérite un badge"""
        # Ne pas re-attribuer si déjà obtenu
        if UserBadge.objects.filter(user=user, badge=badge).exists():
            return False
        
        criteria = badge.criteria
        badge_type = badge.badge_type
        
        # Vérification selon le type de badge
        if badge_type == 'performance':
            return BadgeChecker._check_performance(user, badge, criteria)
        elif badge_type == 'streak':
            return BadgeChecker._check_streak(user, badge, criteria)
        elif badge_type == 'completion':
            return BadgeChecker._check_completion(user, badge, criteria)
        elif badge_type == 'mastery':
            return BadgeChecker._check_mastery(user, badge, criteria)
        
        return False
    
    @staticmethod
    def _check_performance(user, badge, criteria):
        """Vérifie les badges de performance"""
        from apps.quizzes.models import QuizAttempt
        
        # Exemple: score minimum sur X quiz
        if 'min_score' in criteria and 'min_attempts' in criteria:
            attempts = QuizAttempt.objects.filter(
                student=user,
                score__gte=criteria['min_score']
            ).count()
            
            if attempts >= criteria['min_attempts']:
                UserBadge.objects.create(user=user, badge=badge)
                return True
        
        return False
    
    @staticmethod
    def _check_streak(user, badge, criteria):
        """Vérifie les badges de série"""
        from apps.quizzes.models import QuizAttempt
        from django.utils import timezone
        from datetime import timedelta
        
        # Exemple: X jours consécutifs
        if 'days' in criteria:
            today = timezone.now().date()
            attempts = QuizAttempt.objects.filter(
                student=user,
                completed_at__date__gte=today - timedelta(days=criteria['days'])
            ).dates('completed_at', 'day')
            
            if len(list(attempts)) >= criteria['days']:
                UserBadge.objects.create(user=user, badge=badge)
                return True
        
        return False
    
    @staticmethod
    def _check_completion(user, badge, criteria):
        """Vérifie les badges de complétion"""
        from apps.quizzes.models import QuizAttempt
        
        # Exemple: X quiz complétés
        if 'total_quizzes' in criteria:
            completed = QuizAttempt.objects.filter(
                student=user,
                status='completed'
            ).count()
            
            if completed >= criteria['total_quizzes']:
                UserBadge.objects.create(user=user, badge=badge)
                return True
        
        return False
    
    @staticmethod
    def _check_mastery(user, badge, criteria):
        """Vérifie les badges de maîtrise"""
        from apps.quizzes.models import QuizAttempt
        
        # Exemple: Score parfait sur X quiz
        if 'perfect_scores' in criteria:
            perfect = QuizAttempt.objects.filter(
                student=user,
                score=100
            ).count()
            
            if perfect >= criteria['perfect_scores']:
                UserBadge.objects.create(user=user, badge=badge)
                return True
        
        return False
