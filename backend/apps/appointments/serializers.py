from rest_framework import serializers
from datetime import date
from .models import Appointment, ConsultationNote, Payment
from apps.users.serializers import DoctorProfileSerializer, UserSerializer

class ConsultationNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationNote
        fields = '__all__'
        read_only_fields = ['id', 'appointment', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.full_name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization.name', read_only=True, default='')
    consultation_note = ConsultationNoteSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['id', 'patient', 'jitsi_room_name', 'created_at', 'updated_at']

    def validate(self, data):
        # Validate future date
        appointment_date = data.get('date')
        if appointment_date and appointment_date < date.today():
            raise serializers.ValidationError({'date': 'Appointment date must be in the future.'})

        # Validate doctor approval
        doctor = data.get('doctor')
        if doctor and not doctor.is_approved:
            raise serializers.ValidationError({'doctor': 'Cannot book appointment with an unapproved doctor.'})

        return data
