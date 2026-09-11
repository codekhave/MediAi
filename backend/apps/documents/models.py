import uuid
from django.db import models
from django.conf import settings

class MedicalDocument(models.Model):
    TYPE_CHOICES = (
        ('lab_report', 'Lab Test Report'),
        ('prescription', 'Doctor Prescription'),
        ('scan', 'Medical Imaging / Scan'),
        ('other', 'Other Document'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='medical_documents')
    document_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='lab_report')
    title = models.CharField(max_length=200, blank=True, default='Medical Record')
    file = models.FileField(upload_to='patient_documents/', null=True, blank=True)
    cloudinary_url = models.URLField(max_length=500, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'medical_documents'
        ordering = ['-uploaded_at']

    @property
    def get_url(self):
        if self.cloudinary_url:
            return self.cloudinary_url
        if self.file:
            return self.file.url
        return ''

    def __str__(self):
        return f"{self.title} ({self.patient.full_name})"
