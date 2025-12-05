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
    # 🔥 VÉRITABLE JSON HEALER (VERSION INDUSTRIELLE)
    # ============================================================
    def _fix_broken_json(self, text):
        """
        Répare un JSON généré par un modèle LLM même lorsqu'il est STRUCTURELLEMENT cassé.

        - ferme automatiquement les guillemets
        - ferme automatiquement les crochets
        - ferme automatiquement les objets
        - supprime les retours à la ligne illégaux
        - supprime les caractères non imprimables
        - répare les virgules manquantes
        - répare les chaines de choix coupées
        """

        # 1) Nettoyage général
        text = text.replace("\r", "")
        text = re.sub(r'[\x00-\x1F]', ' ', text)

        # 2) Fusionner les lignes cassées dans les strings
        text = re.sub(r'"\s*\n\s*"', '" "', text)

        # 3) Enlever retours à la ligne dans les tableaux
        text = re.sub(r'\[\s*\n', '[', text)
        text = re.sub(r'\n\s*\]', ']', text)

        # 4) Ajouter un guillemet manquant pour un choix cassé
        text = re.sub(r'("D\)[^"]*)(\n|$)', r'\1"', text)

        # 5) Fermer les crochets non fermés
        if text.count("[") > text.count("]"):
            text += "]" * (text.count("[") - text.count("]"))

        # 6) Fermer les accolades non fermées
        if text.count("{") > text.count("}"):
            text += "}" * (text.count("{") - text.count("}"))

        # 7) Ajouter un guillemet fermant si un champ string est ouvert
        to_fix = re.findall(r'"[^"]*$', text)
        if to_fix:
            text += '"'

        # 8) Supprimer virgules finales illégales
        text = re.sub(r',(\s*[}\]])', r'\1', text)

        # 9) Supprimer doubles virgules
        text = text.replace(",,", ",")

        return text

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

        # 🔥 PROMPT ULTRA STRICT (accolades doublées pour f-string)
        prompt = f"""
Tu es une IA experte en génération de QCM universitaires.

🎯 OBJECTIF :
À partir du texte fourni, génère EXACTEMENT {nb_questions} questions QCM pertinentes, claires et bien formulées.

MISSION :
1. Lire tout le texte
2. Mémoriser les concepts clés
3. Générer EXACTEMENT {nb_questions} QCM pertinents

📌 RÈGLES GÉNÉRALES (valables pour TOUS LES DOMAINES) :
- Lire attentivement tout le texte.
- Identifier les idées importantes, définitions, concepts, méthodes, dates, enjeux.
- Formuler de VRAIES QUESTIONS (avec “?”) : jamais de titres, jamais de phrases nominales.
- Tester la compréhension du contenu (pas de questions superficielles).
- AUCUNE invention hors du texte.

CONTRAINTES :
- EXACTEMENT 4 choix : A, B, C, D
- answer = "A" | "B" | "C" | "D"
- Distracteurs plausibles
- Aucune invention hors du texte
- JSON strict

FORMAT EXACT ATTENDU :
{{
  "questions": [
    {{
      "type": "qcm",
      "question": "Texte de la question ?",
      "choices": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "A",
      "explanation": "Explication ici."
    }}
  ]
}}

TEXTE :
{text}

⚠️ RÉPONDS UNIQUEMENT AVEC LE JSON CI-DESSUS.
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
            print(f"ERREUR réseau Ollama: {e}")
            raise

        # 🔥 PARSE JSON ULTRA ROBUSTE
        questions = self._parse_response(full_response)

        if not questions:
            print("⚠️ WARN: Aucune question extraite — Fallback utilisé.")
            questions = self._create_manual_questions(nb_questions)

        return questions

    # ============================================================
    # 🔥 PARSEUR JSON FINAL, AVEC RÉPARATION AVANCÉE
    # ============================================================
    def _parse_response(self, text):
        if not text:
            return None

        clean = text.strip()

        # 1) retirer tout avant {
        clean = re.sub(r'^[^{]*', '', clean)

        # 2) retirer tout après le dernier }
        clean = re.sub(r'[^}]*$', '', clean)

        # 3) PASSER PAR LE JSON HEALER
        clean = self._fix_broken_json(clean)

        # TENTATIVE 1 : parse direct
        try:
            data = json.loads(clean)
            return data.get("questions", None)
        except:
            pass

        # TENTATIVE 2 : extraction du plus grand bloc JSON possible
        try:
            json_block = re.search(r'\{.*\}', clean, re.DOTALL).group(0)
            json_block = self._fix_broken_json(json_block)
            data = json.loads(json_block)
            return data.get("questions", None)
        except:
            pass

        print("⚠️ IMPOSSIBLE DE PARSER (après guérison) :")
        print(clean)
        return None

    # ============================================================
    # 🔥 FALLBACK AUTOMATIQUE
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
