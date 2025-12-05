import os
from PyPDF2 import PdfReader
from docx import Document
from PIL import Image
from django.conf import settings

class DocumentProcessor:
    
    @staticmethod
    def extract_text(file_path: str, file_type: str) -> str:
        print("\n" + "="*50)
        print("EXTRACTION DU DOCUMENT")
        print("="*50)
        print(f"Fichier: {file_path}")
        print(f"Type: {file_type}")
        print("="*50)
        
        text = ""
        
        try:
            if file_type == 'pdf':
                text = DocumentProcessor._extract_from_pdf(file_path)
            elif file_type == 'docx':
                text = DocumentProcessor._extract_from_docx(file_path)
            elif file_type == 'txt':
                text = DocumentProcessor._extract_from_txt(file_path)
            elif file_type in ['png', 'jpg', 'jpeg']:
                text = DocumentProcessor._extract_from_image(file_path)
            else:
                print(f"Type non supporte: {file_type}")
                return ""
            
            print("\n" + "-"*50)
            print("TEXTE EXTRAIT:")
            print("-"*50)
            print(text[:2000] if len(text) > 2000 else text)
            print("-"*50)
            print(f"Total: {len(text)} caracteres")
            print("="*50 + "\n")
            
            return text
            
        except Exception as e:
            print(f"ERREUR extraction: {e}")
            return ""
    
    @staticmethod
    def _extract_from_pdf(file_path: str) -> str:
        print("Extraction PDF...")
        text = ""
        try:
            reader = PdfReader(file_path)
            print(f"Pages: {len(reader.pages)}")
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                text += page_text + "\n"
                print(f"  Page {i+1}: {len(page_text)} car")
        except Exception as e:
            print(f"Erreur PDF: {e}")
        return text.strip()
    
    @staticmethod
    def _extract_from_docx(file_path: str) -> str:
        print("Extraction DOCX...")
        text = ""
        try:
            doc = Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            text = "\n".join(paragraphs)
            print(f"Paragraphes: {len(paragraphs)}")
        except Exception as e:
            print(f"Erreur DOCX: {e}")
        return text.strip()
    
    @staticmethod
    def _extract_from_txt(file_path: str) -> str:
        print("Extraction TXT...")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read().strip()
        except UnicodeDecodeError:
            with open(file_path, 'r', encoding='latin-1') as f:
                return f.read().strip()
    
    @staticmethod
    def _extract_from_image(file_path: str) -> str:
        print("Extraction Image (OCR)...")
        try:
            import pytesseract
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image, lang='fra+eng')
            return text.strip()
        except Exception as e:
            print(f"Erreur OCR: {e}")
            return ""
    
    @staticmethod
    def clean_text(text: str) -> str:
        import re
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n\s*\n', '\n\n', text)
        return text.strip()
