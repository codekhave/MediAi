from rest_framework import serializers
from .models import MedicalDocument

class MedicalDocumentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    document_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    title = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = MedicalDocument
        fields = [
            'id', 'patient', 'patient_name', 'document_type', 'title', 
            'file', 'cloudinary_url', 'document_url', 'file_name', 'file_size', 'uploaded_at'
        ]
        read_only_fields = ['id', 'patient', 'uploaded_at', 'document_url']

    def get_document_url(self, obj):
        if obj.cloudinary_url:
            return obj.cloudinary_url
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return ''

    def get_file_name(self, obj):
        if obj.file:
            return obj.file.name.split('/')[-1]
        return obj.title

    def get_file_size(self, obj):
        if obj.file:
            try:
                sz = obj.file.size
                if sz < 1024 * 1024:
                    return f"{sz / 1024:.1f} KB"
                return f"{sz / (1024 * 1024):.1f} MB"
            except Exception:
                return ''
        return ''
