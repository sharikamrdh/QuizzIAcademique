"""
Views for Course and Document management.
"""

from django.db.models import Q
from rest_framework import generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Course, Document, CourseEnrollment
from .serializers import (
    CourseSerializer,
    CourseDetailSerializer,
    CourseCreateSerializer,
    DocumentSerializer,
    DocumentDetailSerializer,
    DocumentUploadSerializer,
    CourseEnrollmentSerializer,
)
from services.document_processor import DocumentProcessor


class CourseViewSet(ModelViewSet):
    """ViewSet for Course CRUD operations."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Users can see their own courses and public courses
        return Course.objects.filter(
            Q(owner=user) | Q(is_public=True)
        ).select_related('owner').prefetch_related('documents')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        if self.action == 'create':
            return CourseCreateSerializer
        return CourseSerializer
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'], url_path='upload')
    def upload_document(self, request, pk=None):
        """Upload a document to a course."""
        course = self.get_object()
        
        # Check permission
        if course.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez pas ajouter de documents à ce cours.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = DocumentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        file = serializer.validated_data['file']
        title = serializer.validated_data.get('title', file.name)
        
        # Create document
        document = Document.objects.create(
            course=course,
            title=title,
            file=file,
            uploaded_by=request.user
        )
        
        # Process document asynchronously (simplified - synchronous for now)
        processor = DocumentProcessor()
        try:
            document.processing_status = Document.ProcessingStatus.PROCESSING
            document.save()
            
            extracted_text = processor.extract_text(document.file.path, document.file_type)
            document.extracted_text = extracted_text
            document.processing_status = Document.ProcessingStatus.COMPLETED
            document.save()
        except Exception as e:
            document.processing_status = Document.ProcessingStatus.FAILED
            document.processing_error = str(e)
            document.save()
        
        return Response(
            DocumentSerializer(document).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'], url_path='enroll')
    def enroll(self, request, pk=None):
        """Enroll current user to a course."""
        course = self.get_object()
        
        enrollment, created = CourseEnrollment.objects.get_or_create(
            student=request.user,
            course=course
        )
        
        if created:
            return Response(
                {'message': 'Inscription réussie.'},
                status=status.HTTP_201_CREATED
            )
        return Response(
            {'message': 'Vous êtes déjà inscrit à ce cours.'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], url_path='unenroll')
    def unenroll(self, request, pk=None):
        """Unenroll current user from a course."""
        course = self.get_object()
        
        deleted, _ = CourseEnrollment.objects.filter(
            student=request.user,
            course=course
        ).delete()
        
        if deleted:
            return Response({'message': 'Désinscription réussie.'})
        return Response(
            {'message': "Vous n'êtes pas inscrit à ce cours."},
            status=status.HTTP_400_BAD_REQUEST
        )


class DocumentViewSet(ModelViewSet):
    """ViewSet for Document operations."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.filter(
            Q(course__owner=self.request.user) | Q(course__is_public=True)
        ).select_related('course', 'uploaded_by')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DocumentDetailSerializer
        return DocumentSerializer
    
    @action(detail=True, methods=['post'], url_path='reprocess')
    def reprocess(self, request, pk=None):
        """Reprocess a failed document."""
        document = self.get_object()
        
        if document.course.owner != request.user:
            return Response(
                {'error': 'Non autorisé.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        processor = DocumentProcessor()
        try:
            document.processing_status = Document.ProcessingStatus.PROCESSING
            document.processing_error = ''
            document.save()
            
            extracted_text = processor.extract_text(document.file.path, document.file_type)
            document.extracted_text = extracted_text
            document.processing_status = Document.ProcessingStatus.COMPLETED
            document.save()
            
            return Response({'message': 'Document retraité avec succès.'})
        except Exception as e:
            document.processing_status = Document.ProcessingStatus.FAILED
            document.processing_error = str(e)
            document.save()
            return Response(
                {'error': f'Échec du traitement: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MyEnrollmentsView(generics.ListAPIView):
    """List user's course enrollments."""
    
    serializer_class = CourseEnrollmentSerializer
    
    def get_queryset(self):
        return CourseEnrollment.objects.filter(
            student=self.request.user
        ).select_related('course', 'course__owner')
