"""
Admin configuration for courses app.
"""

from django.contrib import admin

from .models import Course, Document, CourseEnrollment


class DocumentInline(admin.TabularInline):
    model = Document
    extra = 0
    readonly_fields = ['file_type', 'file_size', 'processing_status', 'created_at']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'category', 'is_public', 'documents_count', 'created_at']
    list_filter = ['category', 'is_public', 'created_at']
    search_fields = ['title', 'description', 'owner__username']
    inlines = [DocumentInline]
    
    def documents_count(self, obj):
        return obj.documents.count()
    documents_count.short_description = 'Documents'


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'file_type', 'processing_status', 'created_at']
    list_filter = ['file_type', 'processing_status', 'created_at']
    search_fields = ['title', 'course__title']
    readonly_fields = ['extracted_text', 'file_size', 'processing_error']


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'progress', 'enrolled_at']
    list_filter = ['enrolled_at']
    search_fields = ['student__username', 'course__title']
