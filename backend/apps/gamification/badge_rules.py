"""
Système de badges pour le Quiz Generator.
"""

from apps.quizzes.models import QuizAttempt
from apps.gamification.models import Badge, UserBadge

# ---------------------------
# Définition des badges
# ---------------------------
BADGE_DEFINITIONS = [
    {
        'code': 'perfect_quiz',
        'name': '100% Parfait',
        'description': 'Obtenir 100% à un quiz',
        'icon': '🎯',
        'condition': lambda stats: stats.get('perfect_quizzes', 0) >= 1
    },
    {
        'code': 'three_perfect',
        'name': 'Triple Parfait',
        'description': 'Réussir 3 quiz à 100% d\'affilée',
        'icon': '🔥',
        'condition': lambda stats: stats.get('perfect_streak', 0) >= 3
    },
    {
        'code': 'course_complete',
        'name': 'Cours Terminé',
        'description': 'Terminer tous les quiz d\'un cours',
        'icon': '🎓',
        'condition': lambda stats: stats.get('completed_courses', 0) >= 1
    },
]

# ---------------------------
# Fonction de vérification des badges
# ---------------------------
def check_badges(user):
    """
    Vérifie et attribue les badges à un utilisateur
    selon ses statistiques.
    """
    # Stats de l'utilisateur
    attempts = QuizAttempt.objects.filter(student=user)
    perfect_quizzes = attempts.filter(score=100).count()

    completed_courses = 0
    # TODO: Implémenter la logique pour compter les cours complétés

    user_stats = {
        'perfect_quizzes': perfect_quizzes,
        'completed_courses': completed_courses,
        # Si tu veux garder "perfect_streak" pour un futur développement, tu peux la laisser à 0
        'perfect_streak': 0,
    }

    new_badges = []

    for badge_def in BADGE_DEFINITIONS:
        badge, _ = Badge.objects.get_or_create(
            code=badge_def['code'],
            defaults={
                'name': badge_def['name'],
                'description': badge_def['description'],
                'icon': badge_def['icon']
            }
        )

        # Vérifie si l'utilisateur a déjà ce badge
        has_badge = UserBadge.objects.filter(user=user, badge=badge).exists()

        if not has_badge and badge_def['condition'](user_stats):
            UserBadge.objects.create(user=user, badge=badge)
            new_badges.append(badge)

    return new_badges
