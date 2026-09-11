import uuid
from django.db import models
from django.conf import settings

class Symptom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, default='General')

    class Meta:
        db_table = 'symptoms'
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.category})"


class AIAssessment(models.Model):
    SEVERITY_CHOICES = (
        ('EMERGENCY', 'Immediate 911 / Emergency Room'),
        ('URGENT', 'Clinic / Urgent Care within 12–24h'),
        ('ROUTINE', 'Doctor Visit / Monitoring'),
        ('SELF_CARE', 'Self-Care & Home Monitoring'),
        # Legacy color fallbacks
        ('red', 'Emergency / Immediate Medical Care'),
        ('yellow', 'Urgent / Consultation Recommended'),
        ('green', 'Routine / Self-Care'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_assessments')
    symptoms = models.ManyToManyField(Symptom, related_name='assessments')
    symptom_notes = models.TextField(blank=True)
    follow_up_answers = models.JSONField(default=dict, blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='ROUTINE')
    summary = models.TextField()
    possible_conditions = models.JSONField(default=list)
    medication_recommendations = models.JSONField(default=list)
    clinical_reasoning = models.JSONField(default=list, blank=True)
    what_to_do_and_not_do = models.JSONField(default=dict, blank=True)
    when_to_visit_clinic = models.JSONField(default=list, blank=True)
    disclaimer = models.TextField(

        default="DISCLAIMER: This AI-generated assessment is for informational and preliminary triage purposes only. "
                "It is NOT a medical diagnosis or clinical opinion. If you are experiencing severe symptoms, please consult a verified physician or visit an emergency room immediately."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_assessments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Assessment ({self.severity}) for {self.patient.full_name} on {self.created_at.strftime('%Y-%m-%d')}"
