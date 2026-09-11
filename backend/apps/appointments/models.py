import uuid
from django.db import models
from django.conf import settings
from apps.users.models import DoctorProfile
from apps.ai_engine.models import AIAssessment

class Appointment(models.Model):
    TYPE_CHOICES = (
        ('video', 'Video Consultation'),
        ('chat', 'Chat Consultation'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patient_appointments')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='doctor_appointments')
    appointment_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='video')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    reason = models.TextField()
    ai_assessment = models.ForeignKey(AIAssessment, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    jitsi_room_name = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'appointments'
        ordering = ['-date', '-start_time']

    def save(self, *args, **kwargs):
        if not self.jitsi_room_name:
            self.jitsi_room_name = f"MediAI-Consult-{self.id.hex[:12]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Appointment: {self.patient.full_name} with Dr. {self.doctor.user.full_name} on {self.date}"


class ConsultationNote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='consultation_note')
    diagnosis = models.TextField()
    subjective = models.TextField(blank=True, help_text="SOAP: Patient's reported symptoms")
    objective = models.TextField(blank=True, help_text="SOAP: Clinical observations")
    assessment_plan = models.TextField(blank=True, help_text="SOAP: Doctor's treatment plan")
    prescription = models.TextField(blank=True, help_text="Medication prescription details")
    shared_with_patient = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'consultation_notes'


class Payment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    provider = models.CharField(max_length=50, default='demo')
    transaction_reference = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'
