"""
Serializers for Course and Document models.
"""

from rest_framework import serializers

from .models import Course, Document, CourseEnrollment


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model."""
    
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'file', 'file_type', 'file_size',
            'processing_status', 'processing_error',
            'uploaded_by', 'uploaded_by_name',
            'extracted_text_length', 'created_at'
        ]
        read_only_fields = [
            'id', 'file_type', 'file_size', 'processing_status',
            'processing_error', 'uploaded_by', 'created_at'
        ]


class DocumentDetailSerializer(DocumentSerializer):
    """Detailed serializer including extracted text."""
    
    class Meta(DocumentSerializer.Meta):
        fields = DocumentSerializer.Meta.fields + ['extracted_text']


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model."""
    
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    documents_count = serializers.IntegerField(read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'category', 'thumbnail',
            'owner', 'owner_name', 'is_public',
            'documents_count', 'is_enrolled',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(student=request.user).exists()
        return False


class CourseDetailSerializer(CourseSerializer):
    """Detailed serializer including documents."""
    
    documents = DocumentSerializer(many=True, read_only=True)
    
    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ['documents', 'total_text_length']


class CourseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a course."""
    
    class Meta:
        model = Course
        fields = ['title', 'description', 'category', 'is_public', 'thumbnail']
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class DocumentUploadSerializer(serializers.Serializer):
    """Serializer for document upload."""
    
    file = serializers.FileField()
    title = serializers.CharField(max_length=255, required=False)
    
    def validate_file(self, value):
        max_size = 10 * 1024 * 1024  # 10 MB
        if value.size > max_size:
            raise serializers.ValidationError('Le fichier ne doit pas dépasser 10 MB.')
        
        allowed_extensions = ['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg']
        ext = value.name.split('.')[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f'Type de fichier non supporté. Extensions autorisées: {", ".join(allowed_extensions)}'
            )
        return value


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for CourseEnrollment."""
    
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = CourseEnrollment
        fields = ['id', 'course', 'enrolled_at', 'progress']
        read_only_fields = ['id', 'enrolled_at']
