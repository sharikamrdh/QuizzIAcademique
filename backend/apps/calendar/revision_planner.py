from datetime import timedelta, datetime, time
from django.utils import timezone
from .models import StudySession, Reminder, StudyPlan

class RevisionPlanner:
    """Génère automatiquement un programme de révision pour un StudyPlan"""

    @staticmethod
    def generate_plan(study_plan: StudyPlan):
        """
        Génère un plan de révision automatique selon la date de l'examen.

        Args:
            study_plan: instance de StudyPlan

        Returns:
            list: Liste des sessions de révision créées
        """
        sessions = []
        user = study_plan.user
        exam_date = study_plan.exam_date
        now = timezone.now().date()

        days_until = (exam_date - now).days

        # Si l'examen est dans moins d'1 jour, planning d'urgence
        if days_until < 1:
            start_time = time(hour=18, minute=0)
            end_time = (datetime.combine(now, start_time) + timedelta(minutes=120)).time()
            session = StudySession.objects.create(
                study_plan=study_plan,
                date=now,
                start_time=start_time,
                end_time=end_time,
                topic="📚 Révision d'urgence",
                description="Révise les points clés, refais les exercices importants"
            )
            sessions.append(session)
            return sessions

        # Planning normal (7,5,3,1 jours avant)
        planning_steps = [
            (7, "🎯 Début des révisions", "Commence les révisions pour ce cours. Fais 2-3 quiz pour identifier tes lacunes.", 90),
            (5, "📖 Révision approfondie", "Reprends tes notes et fais des fiches.", 120),
            (3, "🔍 Révision des erreurs", "Refais les quiz ratés et points faibles.", 90),
            (1, "🎓 Révision finale", "Dernière révision : flashcards, formules, points clés.", 60)
        ]

        for days_before, title, description, duration in planning_steps:
            if days_until >= days_before:
                session_date = exam_date - timedelta(days=days_before)
                start_time = time(hour=18, minute=0)
                end_time = (datetime.combine(session_date, start_time) + timedelta(minutes=duration)).time()

                session = StudySession.objects.create(
                    study_plan=study_plan,
                    date=session_date,
                    start_time=start_time,
                    end_time=end_time,
                    topic=title,
                    description=description
                )
                sessions.append(session)

                # Créer un rappel simple (à adapter si tu veux lier à Event)
                Reminder.objects.create(
                    event=None,
                    reminder_type='notification',
                    timing=f'{days_before}d',
                    is_sent=False
                )

        return sessions

    @staticmethod
    def calculate_preparation_progress(study_plan: StudyPlan):
        """
        Calcule le pourcentage de préparation pour un StudyPlan

        Args:
            study_plan: instance de StudyPlan

        Returns:
            dict: Statistiques de préparation
        """
        sessions = study_plan.sessions.all()
        total_sessions = sessions.count()
        completed_sessions = sessions.filter(is_completed=True).count()

        progress = round((completed_sessions / total_sessions) * 100, 1) if total_sessions else 0

        return {
            'progress_percentage': progress,
            'sessions_completed': completed_sessions,
            'sessions_total': total_sessions,
            'is_well_prepared': progress >= 70
        }
