import uuid
from datetime import timedelta
from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    User, Specialization, PatientProfile, DoctorProfile, 
    DoctorDocument, DoctorAvailability, DoctorVacation, DoctorRating,
    EmailVerificationOTP
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
    specialization_id = serializers.CharField(required=False, write_only=True, allow_blank=True, allow_null=True)

    def validate_specialization_id(self, value):
        if not value or not str(value).strip():
            return None
        try:
            return uuid.UUID(str(value).strip())
        except (ValueError, AttributeError):
            raise serializers.ValidationError("Must be a valid UUID.")

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'role', 'phone_number', 'licence_number', 'specialization_id']

    def create(self, validated_data):
        licence_number = validated_data.pop('licence_number', '')
        specialization_id = validated_data.pop('specialization_id', None)
        role = validated_data.get('role', 'patient')

        # Create user with unverified email requiring 6-digit OTP verification
        user = User.objects.create_user(is_email_verified=False, **validated_data)
        
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
                is_approved=True
            )

        # Dispatch 6-digit verification OTP
        from .utils import generate_and_send_otp
        _, otp_code = generate_and_send_otp(user, purpose='registration')
        user._dev_otp = otp_code

        return user


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    purpose = serializers.ChoiceField(choices=EmailVerificationOTP.PURPOSE_CHOICES, default='registration')

    def validate(self, data):
        email = data.get('email', '').strip()
        otp = data.get('otp', '').strip()
        purpose = data.get('purpose', 'registration')

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            raise serializers.ValidationError({'email': 'Account not found with this email address.'})

        # Check latest active OTP
        otp_record = EmailVerificationOTP.objects.filter(
            user=user,
            purpose=purpose,
            is_used=False
        ).order_by('-created_at').first()

        if not otp_record:
            raise serializers.ValidationError({'otp': 'No active verification code found. Please click Resend Code.'})

        if otp_record.is_expired:
            raise serializers.ValidationError({'otp': 'This verification code has expired. Please request a new code.'})

        if otp_record.attempts >= 5:
            otp_record.is_used = True
            otp_record.save()
            raise serializers.ValidationError({'otp': 'Too many failed attempts. Please request a new code.'})

        if otp_record.otp_code != otp:
            otp_record.attempts += 1
            otp_record.save()
            remaining = 5 - otp_record.attempts
            raise serializers.ValidationError({'otp': f'Incorrect code. {remaining} attempt(s) remaining.'})

        # Code matched successfully!
        otp_record.is_used = True
        otp_record.save()

        user.is_email_verified = True
        user.save(update_fields=['is_email_verified'])

        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['name'] = user.full_name

        return {
            'message': 'Email verified successfully! Welcome to MediAI.',
            'email': user.email,
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh_token': str(refresh),
        }


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=EmailVerificationOTP.PURPOSE_CHOICES, default='registration')

    def validate(self, data):
        email = data.get('email', '').strip()
        purpose = data.get('purpose', 'registration')

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            raise serializers.ValidationError({'email': 'No account associated with this email.'})

        # Cooldown check: 60 seconds
        recent_otp = EmailVerificationOTP.objects.filter(
            user=user,
            purpose=purpose,
            created_at__gte=timezone.now() - timedelta(seconds=60)
        ).first()

        if recent_otp:
            time_passed = (timezone.now() - recent_otp.created_at).total_seconds()
            wait_seconds = int(60 - time_passed)
            raise serializers.ValidationError({
                'cooldown': f'Please wait {max(1, wait_seconds)} seconds before requesting another code.'
            })

        from .utils import generate_and_send_otp
        _, new_otp = generate_and_send_otp(user, purpose=purpose)

        return {
            'message': f'A new 6-digit verification code has been dispatched to {user.email}.',
            'email': user.email,
            'dev_otp': new_otp
        }


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, data):
        email = data.get('email', '').strip()
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            raise serializers.ValidationError({'email': 'No registered account found with this email address.'})

        from .utils import generate_and_send_otp
        _, otp_code = generate_and_send_otp(user, purpose='password_reset')
        return {
            'message': f'A password reset authorization code has been dispatched to {user.email}.',
            'email': user.email,
            'dev_otp': otp_code
        }


class ResetPasswordOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        email = data.get('email', '').strip()
        otp = data.get('otp', '').strip()
        new_password = data.get('new_password', '')

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            raise serializers.ValidationError({'email': 'Account not found.'})

        otp_record = EmailVerificationOTP.objects.filter(
            user=user,
            purpose='password_reset',
            is_used=False
        ).order_by('-created_at').first()

        if not otp_record:
            raise serializers.ValidationError({'otp': 'No active password reset code found. Please request a new code.'})

        if otp_record.is_expired:
            raise serializers.ValidationError({'otp': 'This code has expired. Please request a new code.'})

        if otp_record.attempts >= 5:
            otp_record.is_used = True
            otp_record.save()
            raise serializers.ValidationError({'otp': 'Too many invalid attempts. Please request a new reset code.'})

        if otp_record.otp_code != otp:
            otp_record.attempts += 1
            otp_record.save()
            raise serializers.ValidationError({'otp': f'Incorrect code. {5 - otp_record.attempts} attempts remaining.'})

        otp_record.is_used = True
        otp_record.save()

        user.set_password(new_password)
        user.save()

        return {
            'message': 'Password has been successfully updated. You can now log in with your new password.'
        }


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

        # Check if email is verified
        if not user.is_email_verified:
            from .utils import generate_and_send_otp
            _, dev_otp = generate_and_send_otp(user, purpose='registration')
            raise serializers.ValidationError({
                'requires_verification': True,
                'email': user.email,
                'dev_otp': dev_otp,
                'message': 'Please verify your email address to access your clinical portal.'
            })

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
