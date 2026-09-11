from rest_framework import serializers
from .models import EmergencyRequest
from apps.users.serializers import DoctorProfileSerializer, UserSerializer

class EmergencyRequestSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    patient_phone = serializers.CharField(source='patient.phone_number', read_only=True)
    assigned_doctor_name = serializers.CharField(source='assigned_doctor.user.full_name', read_only=True)

    class Meta:
        model = EmergencyRequest
        fields = '__all__'
        read_only_fields = ['id', 'patient', 'status', 'assigned_doctor', 'created_at', 'updated_at']
