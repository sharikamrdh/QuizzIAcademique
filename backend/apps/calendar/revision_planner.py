from datetime import timedelta
from django.utils import timezone
from .models import RevisionSession, Reminder


class RevisionPlanner:
    """Génère automatiquement un programme de révision pour un contrôle"""
    
    @staticmethod
    def generate_plan(exam):
        """
        Génère un plan de révision automatique selon la date du contrôle
        
        Args:
            exam: Instance de Exam
        
        Returns:
            list: Liste des sessions de révision créées
        """
        sessions = []
        user = exam.user
        exam_date = exam.exam_date
        now = timezone.now()
        
        # Calculer les dates de révision
        days_until = (exam_date - now).days
        
        # Si l'examen est dans moins de 24h, planning d'urgence
        if days_until < 1:
            session = RevisionSession.objects.create(
                exam=exam,
                user=user,
                title="📚 Révision d'urgence",
                description="Révise les points clés, refais les exercices importants",
                planned_date=now,
                duration=120  # 2h
            )
            sessions.append(session)
            return sessions
        
        # Planning normal selon la difficulté et le temps disponible
        difficulty = exam.difficulty
        
        # --- 7 jours avant (si possible) ---
        if days_until >= 7:
            date_7days = exam_date - timedelta(days=7)
            session = RevisionSession.objects.create(
                exam=exam,
                user=user,
                title="🎯 Début des révisions",
                description=f"Commence les révisions pour {exam.title}. Fais 2-3 quiz du cours pour identifier tes lacunes.",
                planned_date=date_7days.replace(hour=18, minute=0),
                duration=90
            )
            sessions.append(session)
            
            # Créer un rappel
            Reminder.objects.create(
                exam=exam,
                user=user,
                message=f"⏰ Commence les révisions pour {exam.title} ! 7 jours avant le contrôle.",
                remind_at=date_7days.replace(hour=9, minute=0)
            )
        
        # --- 5 jours avant ---
        if days_until >= 5:
            date_5days = exam_date - timedelta(days=5)
            session = RevisionSession.objects.create(
                exam=exam,
                user=user,
                title="📖 Révision approfondie",
                description="Révise les chapitres importants. Reprends tes notes et fais des fiches.",
                planned_date=date_5days.replace(hour=18, minute=0),
                duration=120 if difficulty >= 4 else 90
            )
            sessions.append(session)
        
        # --- 3 jours avant ---
        if days_until >= 3:
            date_3days = exam_date - timedelta(days=3)
            session = RevisionSession.objects.create(
                exam=exam,
                user=user,
                title="🔍 Révision des erreurs",
                description="Refais les quiz que tu as ratés. Concentre-toi sur tes points faibles.",
                planned_date=date_3days.replace(hour=18, minute=0),
                duration=90
            )
            sessions.append(session)
            
            # Rappel
            Reminder.objects.create(
                exam=exam,
                user=user,
                message=f"⚠️ Plus que 3 jours avant {exam.title} ! Révise tes erreurs.",
                remind_at=date_3days.replace(hour=9, minute=0)
            )
        
        # --- 1 jour avant ---
        date_1day = exam_date - timedelta(days=1)
        session = RevisionSession.objects.create(
            exam=exam,
            user=user,
            title="🎓 Révision finale",
            description="Dernière révision : flashcards, formules, points clés. Relis tes fiches.",
            planned_date=date_1day.replace(hour=19, minute=0),
            duration=60
        )
        sessions.append(session)
        
        # Rappel
        Reminder.objects.create(
            exam=exam,
            user=user,
            message=f"🔥 Demain c'est {exam.title} ! Dernière révision ce soir.",
            remind_at=date_1day.replace(hour=9, minute=0)
        )
        
        # --- Jour J ---
        # Rappel le matin
        Reminder.objects.create(
            exam=exam,
            user=user,
            message=f"📝 Aujourd'hui : {exam.title} à {exam_date.strftime('%H:%M')}. Bonne chance ! 💪",
            remind_at=exam_date.replace(hour=7, minute=0)
        )
        
        return sessions
    
    @staticmethod
    def get_recommended_quizzes(exam):
        """
        Recommande des quiz à faire pour préparer le contrôle
        
        Args:
            exam: Instance de Exam
        
        Returns:
            QuerySet: Quiz recommandés
        """
        from apps.quizzes.models import Quiz
        
        if not exam.course:
            return Quiz.objects.none()
        
        # Récupérer les quiz du cours
        quizzes = Quiz.objects.filter(course=exam.course, status='published')
        
        # Prioriser les quiz que l'utilisateur a mal réussis
        from apps.quizzes.models import QuizAttempt
        failed_quizzes = QuizAttempt.objects.filter(
            student=exam.user,
            quiz__course=exam.course,
            score__lt=70
        ).values_list('quiz_id', flat=True)
        
        # Recommander d'abord les quiz ratés
        recommended = quizzes.filter(id__in=failed_quizzes)
        
        # Si pas assez, ajouter d'autres quiz du cours
        if recommended.count() < 3:
            other_quizzes = quizzes.exclude(id__in=failed_quizzes)[:3]
            recommended = recommended | other_quizzes
        
        return recommended[:5]  # Maximum 5 quiz recommandés
    
    @staticmethod
    def calculate_preparation_progress(exam):
        """
        Calcule le pourcentage de préparation pour un contrôle
        
        Args:
            exam: Instance de Exam
        
        Returns:
            dict: Statistiques de préparation
        """
        sessions = exam.revision_sessions.all()
        total_sessions = sessions.count()
        completed_sessions = sessions.filter(status='completed').count()
        
        # Progression en %
        if total_sessions == 0:
            progress = 0
        else:
            progress = round((completed_sessions / total_sessions) * 100, 1)
        
        # Quiz recommandés
        recommended_quizzes = RevisionPlanner.get_recommended_quizzes(exam)
        
        # Quiz déjà faits
        from apps.quizzes.models import QuizAttempt
        completed_quizzes = QuizAttempt.objects.filter(
            student=exam.user,
            quiz__in=recommended_quizzes,
            status='completed'
        ).values_list('quiz_id', flat=True).distinct()
        
        quizzes_done = len(completed_quizzes)
        quizzes_total = recommended_quizzes.count()
        
        return {
            'progress_percentage': progress,
            'sessions_completed': completed_sessions,
            'sessions_total': total_sessions,
            'quizzes_done': quizzes_done,
            'quizzes_total': quizzes_total,
            'is_well_prepared': progress >= 70 and quizzes_done >= (quizzes_total * 0.6)
        }
