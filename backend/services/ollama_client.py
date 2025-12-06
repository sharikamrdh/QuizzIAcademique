import json
import re
import requests
from django.conf import settings

class OllamaClient:
    def __init__(self):
        self.base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
        self.model = getattr(settings, 'OLLAMA_MODEL', 'qcm-generator')
        self.timeout = getattr(settings, 'OLLAMA_TIMEOUT', 300)

    # ============================================================
    # 🔥 PROMPT + GENERATION
    # ============================================================
    def generate_questions(self, text, nb_questions=10, difficulty='intermediaire', question_types=None):
        max_chars = 2000
        if len(text) > max_chars:
            text = text[:max_chars]

        print("\n" + "="*50)
        print("GENERATION QCM")
        print(f"Modele: {self.model}")
        print(f"Taille texte: {len(text)} caracteres")
        print(f"Questions: {nb_questions}")
        print("="*50)

        # ------------------------------------------------------------
        # 🎯 PROMPT OFFICIEL — Format QCM-TEXT (pas de JSON)
        # ------------------------------------------------------------
        prompt = f"""
Tu es une IA experte en génération de QCM universitaires.

🎯 OBJECTIF :
À partir du texte fourni, générer EXACTEMENT {nb_questions} questions QCM pertinentes, claires et bien formulées.

📌 MISSION :
1. Lire attentivement tout le texte.
2. Mémoriser les concepts clés, notions importantes, définitions, exemples et explications.
3. Générer EXACTEMENT {nb_questions} QCM pertinents basés uniquement sur ces informations.

📌 FORMULATION DES QUESTIONS :
- Chaque question doit être une vraie question avec “?”.
- Jamais de titres, jamais de phrases nominales.
- Chaque QCM doit tester un concept réel du texte.

📌 FORMAT STRICT (PAS DE JSON, PAS DE MARKDOWN) :

Q1: [question ?]
A) [choix A]
B) [choix B]
C) [choix C]
D) [choix D]
ANSWER: [A/B/C/D]
EXPLANATION: [explication]

Q2: ...
(etc.)

📄 TEXTE :
{text}
"""

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": True
        }

        print("\nEnvoi Ollama...\n")
        full_response = ""

        try:
            with requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=self.timeout,
                stream=True
            ) as r:
                r.raise_for_status()

                for line in r.iter_lines(decode_unicode=True):
                    if not line:
                        continue

                    try:
                        chunk = json.loads(line)
                        content = chunk.get("message", {}).get("content", "")

                        if content:
                            print(content, end="", flush=True)
                            full_response += content

                        if chunk.get("done"):
                            break

                    except:
                        pass

            print("\n" + "="*50)
            print(f"Reponse complete: {len(full_response)} car\n")

        except Exception as e:
            print(f"❌ ERREUR réseau Ollama: {e}")
            raise

        # ------------------------------------------------------------
        # 🔥 PARSE DU FORMAT QCM-TEXT (plus de JSON)
        # ------------------------------------------------------------
        questions = self._parse_qcm_text(full_response)

        if not questions:
            print("⚠️ WARN: Aucune question extraite — Fallback utilisé.")
            questions = self._create_manual_questions(nb_questions)

        return questions

    # ============================================================
    # 🔥 NOUVEAU PARSEUR — FORMAT QCM-TEXT
    # ============================================================
    def _parse_qcm_text(self, raw):
        """
        Parse un format :

        Q1: Question ?
        A) ...
        B) ...
        C) ...
        D) ...
        ANSWER: A
        EXPLANATION: texte
        """

        if not raw:
            return None

        # découper par Q1:, Q2:, Q3:, etc.
        blocks = re.split(r'\bQ[0-9]+[:：]', raw)[1:]
        questions = []

        for block in blocks:
            lines = [l.strip() for l in block.split("\n") if l.strip()]

            # il faut au minimum 7 lignes dans un QCM complet
            if len(lines) < 7:
                continue

            try:
                # Question = ligne 1
                question = lines[0]

                # Choix
                choiceA = lines[1][3:].strip()
                choiceB = lines[2][3:].strip()
                choiceC = lines[3][3:].strip()
                choiceD = lines[4][3:].strip()

                # Answer
                match_answer = re.search(r'ANSWER\s*[:：]\s*([ABCD])', block)
                if not match_answer:
                    continue
                answer = match_answer.group(1)

                # Explanation
                match_exp = re.search(r'EXPLANATION\s*[:：]\s*(.*)', block)
                explanation = match_exp.group(1) if match_exp else ""

                # Construire l'objet
                questions.append({
                    "type": "qcm",
                    "question": question,
                    "choices": [
                        f"A) {choiceA}",
                        f"B) {choiceB}",
                        f"C) {choiceC}",
                        f"D) {choiceD}"
                    ],
                    "answer": answer,
                    "explanation": explanation
                })

            except Exception as e:
                print(f"Erreur parsing bloc QCM: {e}")
                continue

        return questions if questions else None

    # ============================================================
    # 🔥 FALLBACK — si jamais l’IA renvoie rien
    # ============================================================
    def _create_manual_questions(self, nb=3):
        return [
            {
                "type": "qcm",
                "question": f"Question par défaut {i+1} ?",
                "choices": ["A) ...", "B) ...", "C) ...", "D) ..."],
                "answer": "A",
                "explanation": "Fallback utilisé car la génération IA était invalide."
            }
            for i in range(nb)
        ]

