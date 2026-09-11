from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import MedicalDocument
from .serializers import MedicalDocumentSerializer

class MedicalDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicalDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return MedicalDocument.objects.filter(patient=user)
        elif user.role == 'doctor' or user.role == 'admin':
            return MedicalDocument.objects.all()
        return MedicalDocument.objects.none()

    def perform_create(self, serializer):
        title = self.request.data.get('title', '').strip()
        file_obj = self.request.FILES.get('file')
        if not title and file_obj:
            # Clean up filename for display: e.g. "blood_test_2026.pdf" -> "Blood Test 2026"
            raw_name = file_obj.name.rsplit('.', 1)[0]
            title = raw_name.replace('_', ' ').replace('-', ' ').title()
        if not title:
            title = "Medical Record"
        
        doc_type = self.request.data.get('document_type', 'lab_report')
        serializer.save(patient=self.request.user, title=title, document_type=doc_type)


class MedicalDocumentDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = MedicalDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['doctor', 'admin']:
            return MedicalDocument.objects.all()
        return MedicalDocument.objects.filter(patient=user)
