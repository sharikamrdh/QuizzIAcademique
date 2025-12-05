# 📚 Documentation d'Installation - Quiz Generator

## Table des matières

1. [Prérequis](#prérequis)
2. [Installation d'Ollama](#installation-dollama)
3. [Configuration du Backend](#configuration-du-backend)
4. [Configuration du Frontend](#configuration-du-frontend)
5. [Exemple d'appel API vers Ollama](#exemple-dappel-api-vers-ollama)
6. [Sécurité](#sécurité)
7. [Dépannage](#dépannage)

---

## Prérequis

### Système
- **OS**: Ubuntu 20.04+ / macOS 12+ / Windows 10+ (avec WSL2)
- **RAM**: 8 GB minimum (16 GB recommandé pour Ollama)
- **Disque**: 20 GB d'espace libre

### Logiciels requis
- **Python**: 3.11 ou supérieur
- **Node.js**: 18.x ou supérieur
- **PostgreSQL**: 14 ou supérieur
- **Ollama**: Dernière version

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv nodejs npm postgresql tesseract-ocr poppler-utils

# macOS
brew install python@3.11 node postgresql tesseract poppler
```

---

## Installation d'Ollama

### 1. Installer Ollama

```bash
# Linux/macOS
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Créer le modèle qcm-generator

```bash
# Télécharger le modèle de base
ollama pull llama3.2:latest

# Créer le modèle personnalisé
cd docs
ollama create qcm-generator -f Modelfile
```

### 3. Vérifier l'installation

```bash
ollama list
curl http://localhost:11434/api/tags
```

---

## Configuration du Backend

### 1. Environnement virtuel

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Base de données PostgreSQL

```bash
sudo -u postgres psql
CREATE DATABASE quiz_generator;
CREATE USER quiz_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE quiz_generator TO quiz_user;
\q
```

### 3. Variables d'environnement

```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

### 4. Migrations et démarrage

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

## Configuration du Frontend

```bash
cd frontend
npm install
ng serve
```

Accès: http://localhost:4200

---

## Exemple d'appel API vers Ollama

```python
import requests
import json

payload = {
    "model": "qcm-generator",
    "messages": [{
        "role": "user",
        "content": json.dumps({
            "text": "Le machine learning est une branche de l'IA...",
            "nb_questions": 5,
            "difficulty": "intermediaire"
        })
    }],
    "stream": False
}

response = requests.post("http://localhost:11434/api/chat", json=payload)
result = response.json()
questions = json.loads(result["message"]["content"])
```

---

## Sécurité

- JWT Authentication avec refresh tokens
- CORS configuré pour le frontend
- Validation des fichiers uploadés
- Protection CSRF activée

---

## Dépannage

### Ollama ne répond pas
```bash
curl http://localhost:11434/api/tags
ollama serve
```

### Erreur PostgreSQL
```bash
sudo systemctl status postgresql
```
