import uuid
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    User, Specialization, PatientProfile, DoctorProfile, 
    DoctorDocument, DoctorAvailability, DoctorVacation, DoctorRating
)

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 
            'role', 'phone_number', 'country', 'date_of_birth', 
            'gender', 'avatar', 'is_email_verified', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'role', 'is_email_verified', 'created_at']


class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = '__all__'


class DoctorDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorDocument
        fields = '__all__'
        read_only_fields = ['id', 'doctor', 'uploaded_at']


class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = DoctorAvailability
        fields = '__all__'
        read_only_fields = ['id', 'doctor']


class DoctorRatingSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)

    class Meta:
        model = DoctorRating
        fields = ['id', 'doctor', 'patient', 'patient_name', 'rating', 'review', 'created_at']
        read_only_fields = ['id', 'patient', 'created_at']


class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialization_detail = SpecializationSerializer(source='specialization', read_only=True)
    specialization_id = serializers.PrimaryKeyRelatedField(
        queryset=Specialization.objects.all(), source='specialization', write_only=True, required=False
    )
    documents = DoctorDocumentSerializer(many=True, read_only=True)
    availabilities = DoctorAvailabilitySerializer(many=True, read_only=True)

    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'user', 'specialization', 'specialization_detail', 'specialization_id',
            'licence_number', 'years_of_experience', 'bio', 'consultation_fee',
            'hospital_affiliation', 'is_verified', 'is_approved', 'rating',
            'total_reviews', 'is_available_for_emergency', 'documents', 'availabilities'
        ]
        read_only_fields = ['id', 'is_verified', 'is_approved', 'rating', 'total_reviews']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='patient')
    # Optional fields for Doctor registration
    licence_number = serializers.CharField(required=False, write_only=True, allow_blank=True)
    specialization_id = serializers.UUIDField(required=False, write_only=True, allow_null=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'role', 'phone_number', 'licence_number', 'specialization_id']

    def create(self, validated_data):
        licence_number = validated_data.pop('licence_number', '')
        specialization_id = validated_data.pop('specialization_id', None)
        
        role = validated_data.get('role', 'patient')
        # Auto verify email for instant user testing in dev mode
        user = User.objects.create_user(is_email_verified=True, **validated_data)
        
        if role == 'patient':
            PatientProfile.objects.create(user=user)
        elif role == 'doctor':
            spec = None
            if specialization_id:
                spec = Specialization.objects.filter(id=specialization_id).first()
            DoctorProfile.objects.create(
                user=user, 
                licence_number=licence_number or f"LIC-{uuid.uuid4().hex[:8].upper()}",
                specialization=spec,
                is_approved=True  # Auto approve for development convenience
            )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    token = serializers.CharField(read_only=True)
    refresh_token = serializers.CharField(read_only=True)

    def validate(self, data):
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        user = User.objects.filter(email__iexact=email).first()
        if not user or not user.check_password(password):
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')

        refresh = RefreshToken.for_user(user)
        # Custom claims in JWT token
        refresh['role'] = user.role
        refresh['name'] = user.full_name

        return {
            'email': user.email,
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh_token': str(refresh),
        }
