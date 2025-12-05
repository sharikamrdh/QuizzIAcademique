# 🎓 Quiz Generator - Application de Génération de Quiz avec IA

## 📋 Description

Application web complète permettant de générer automatiquement des quiz à partir de documents (PDF, DOCX, TXT, images) en utilisant un modèle IA local via Ollama.

### Fonctionnalités principales

- **Upload de documents** : PDF, DOCX, TXT, images (avec OCR)
- **Extraction automatique** du texte
- **Génération IA** de questions via Ollama (modèle `qcm-generator`)
- **Types de questions** : QCM, Vrai/Faux, Questions ouvertes, Complétion
- **Paramétrage** : nombre de questions, difficulté (débutant/intermédiaire/avancé)
- **Interface étudiant** : passage de quiz avec timer, correction automatique
- **Dashboard** : statistiques, progression, historique, badges
- **Mode révision** : flashcards

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   Ollama        │
│   Angular 16+   │     │   Django 5 DRF  │     │   qcm-generator │
│   Material UI   │◀────│   PostgreSQL    │◀────│   Local AI      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 📁 Structure du Projet

```
quiz-generator-project/
├── backend/                 # API Django REST Framework
│   ├── config/              # Configuration Django
│   ├── apps/
│   │   ├── users/           # Authentification & Utilisateurs
│   │   ├── courses/         # Gestion des cours & documents
│   │   ├── quizzes/         # Quiz & Questions
│   │   └── analytics/       # Statistiques & Progression
│   ├── services/            # Services métier (Ollama, OCR)
│   └── tests/               # Tests unitaires
├── frontend/                # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Services, Guards, Interceptors
│   │   │   ├── shared/      # Composants partagés
│   │   │   ├── features/    # Modules fonctionnels
│   │   │   └── layout/      # Header, Footer, Sidebar
│   │   └── assets/
│   └── angular.json
├── docs/                    # Documentation
└── diagrams/                # Diagrammes UML
```

## 🚀 Installation

### Prérequis

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Ollama avec le modèle `qcm-generator`

### 1. Configuration d'Ollama

```bash
# Installer Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Créer le modèle qcm-generator (voir Modelfile dans docs/)
ollama create qcm-generator -f Modelfile

# Vérifier que le modèle est disponible
ollama list
```

### 2. Backend Django

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer la base de données
cp .env.example .env
# Éditer .env avec vos paramètres

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### 3. Frontend Angular

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
ng serve

# Accéder à http://localhost:4200
```

## 🔧 Configuration

### Variables d'environnement Backend (.env)

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgres://user:password@localhost:5432/quiz_db
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qcm-generator
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

### Configuration Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
};
```

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register/` - Inscription
- `POST /api/auth/login/` - Connexion (JWT)
- `POST /api/auth/refresh/` - Rafraîchir le token

### Cours & Documents
- `GET /api/courses/` - Liste des cours
- `POST /api/courses/` - Créer un cours
- `POST /api/courses/{id}/upload/` - Upload document
- `GET /api/documents/{id}/` - Détails document

### Quiz
- `POST /api/quizzes/generate/` - Générer un quiz via IA
- `GET /api/quizzes/` - Liste des quiz
- `GET /api/quizzes/{id}/` - Détails quiz
- `POST /api/quizzes/{id}/submit/` - Soumettre réponses
- `GET /api/quizzes/{id}/correction/` - Obtenir correction

### Statistiques
- `GET /api/analytics/dashboard/` - Dashboard étudiant
- `GET /api/analytics/history/` - Historique des quiz
- `GET /api/analytics/progress/` - Progression

## 🤖 Exemple d'appel IA (Ollama)

### Requête vers Ollama

```python
import requests

payload = {
    "model": "qcm-generator",
    "messages": [{
        "role": "user",
        "content": json.dumps({
            "text": "Le machine learning est une branche de l'IA...",
            "nb_questions": 5,
            "difficulty": "intermediaire",
            "question_types": ["qcm", "vf", "completion"]
        })
    }],
    "stream": False
}

response = requests.post(
    "http://localhost:11434/api/chat",
    json=payload
)
```

### Réponse attendue

```json
{
  "questions": [
    {
      "type": "qcm",
      "question": "Qu'est-ce que le machine learning ?",
      "choices": [
        "Une branche de l'IA",
        "Un langage de programmation",
        "Une base de données",
        "Un système d'exploitation"
      ],
      "answer": "Une branche de l'IA",
      "explanation": "Le machine learning est effectivement une branche de l'intelligence artificielle...",
      "difficulty": "intermediaire"
    }
  ]
}
```

## 🔒 Sécurité

- Authentification JWT avec refresh tokens
- Validation des fichiers uploadés (type, taille)
- Protection CSRF
- Rate limiting sur les endpoints sensibles
- Sanitization des entrées utilisateur
- CORS configuré

## 🧪 Tests

```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
ng test
```

## 📄 Licence

MIT License - Voir LICENSE pour plus de détails.

## 👥 Contributeurs

- Développé dans le cadre d'un projet web éducatif
# QuizzIAcademique
