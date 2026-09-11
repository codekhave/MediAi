import uuid
from django.db import models
from django.conf import settings
from apps.users.models import DoctorProfile

class EmergencyRequest(models.Model):
    TYPE_CHOICES = (
        ('cardiac', 'Chest Pain / Cardiac Alert'),
        ('breathing', 'Severe Respiratory Distress'),
        ('trauma', 'Trauma / Severe Bleeding'),
        ('general', 'General Urgent Crisis'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending Duty Doctor'),
        ('assigned', 'Duty Doctor Assigned'),
        ('resolved', 'Resolved'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='emergency_requests')
    emergency_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='general')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    location_address = models.CharField(max_length=255, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True)
    assigned_doctor = models.ForeignKey(DoctorProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_emergencies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'emergency_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"Emergency ({self.emergency_type}) - Patient: {self.patient.full_name}"
