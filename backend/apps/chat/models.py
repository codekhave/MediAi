import uuid
from django.db import models
from django.conf import settings
from apps.users.models import DoctorProfile

class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patient_conversations')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='doctor_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'conversations'
        unique_together = ('patient', 'doctor')
        ordering = ['-updated_at']

    def __str__(self):
        return f"Chat: {self.patient.full_name} & Dr. {self.doctor.user.full_name}"


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField(blank=True, default='')
    file = models.FileField(upload_to='chat_attachments/', null=True, blank=True)
    file_type = models.CharField(max_length=50, blank=True, help_text="image, video, audio, or document")
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.CharField(max_length=50, blank=True)
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['timestamp']

    def __str__(self):
        return f"Msg from {self.sender.first_name} at {self.timestamp.strftime('%H:%M')}"
