from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.quizzes.models import QuizAttempt
from .badge_rules import check_badges
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=QuizAttempt)
def check_badges_after_quiz(sender, instance, created, **kwargs):
    """
    Signal déclenché après la sauvegarde d'une tentative de quiz.
    Vérifie et attribue automatiquement les badges mérités.
    
    Args:
        sender: Le modèle qui a envoyé le signal (QuizAttempt)
        instance: L'instance de QuizAttempt qui vient d'être sauvegardée
        created: True si c'est une nouvelle instance, False si c'est une mise à jour
        **kwargs: Arguments supplémentaires
    """
    # Vérifier seulement si le quiz est terminé
    if instance.status == QuizAttempt.Status.COMPLETED:
        try:
            # Vérifier tous les badges possibles
            badges_earned = BadgeChecker.check_all_badges(instance.student, instance)
            
            # Logger les badges obtenus
            if badges_earned:
                logger.info(
                    f"🎖️ Badges attribués à {instance.student.username}: {', '.join(badges_earned)}"
                )
                print(f"✅ Badges attribués à {instance.student.username}: {', '.join(badges_earned)}")
            else:
                logger.debug(
                    f"Aucun nouveau badge pour {instance.student.username} (quiz: {instance.quiz.title})"
                )
                
        except Exception as e:
            logger.error(f"❌ Erreur lors de la vérification des badges: {str(e)}")
            print(f"❌ Erreur lors de la vérification des badges: {str(e)}")
