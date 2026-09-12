import uuid
from datetime import timedelta
from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_email_verified', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('admin', 'Admin'),
    )
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=254)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    phone_number = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    avatar = models.URLField(blank=True, max_length=500)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    google_id = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return f"{self.full_name} ({self.role}) - {self.email}"


class Specialization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='Stethoscope')

    class Meta:
        db_table = 'specializations'
        ordering = ['name']

    def __str__(self):
        return self.name


class PatientProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    blood_group = models.CharField(max_length=10, blank=True)
    allergies = models.TextField(blank=True, help_text="Comma-separated list of known allergies")
    chronic_conditions = models.TextField(blank=True, help_text="Comma-separated list of chronic conditions")
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'patient_profiles'

    def __str__(self):
        return f"PatientProfile for {self.user.full_name}"


class DoctorProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.ForeignKey(Specialization, on_delete=models.SET_NULL, null=True, related_name='doctors')
    licence_number = models.CharField(max_length=100, unique=True)
    years_of_experience = models.PositiveIntegerField(default=1)
    bio = models.TextField(blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    hospital_affiliation = models.CharField(max_length=200, blank=True)
    is_verified = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    total_reviews = models.PositiveIntegerField(default=0)
    is_available_for_emergency = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctor_profiles'

    def __str__(self):
        return f"Dr. {self.user.full_name} ({self.specialization.name if self.specialization else 'General'})"


class DoctorDocument(models.Model):
    DOCUMENT_TYPES = (
        ('licence', 'Medical Licence'),
        ('degree', 'Degree Certificate'),
        ('id_card', 'Government ID'),
        ('other', 'Other Document'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    file_url = models.URLField(max_length=500)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'doctor_documents'


class DoctorAvailability(models.Model):
    DAY_CHOICES = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = 'doctor_availabilities'
        unique_together = ('doctor', 'day_of_week', 'start_time')


class DoctorVacation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='vacations')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'doctor_vacations'


class DoctorRating(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='ratings')
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='doctor_ratings_given')
    rating = models.PositiveSmallIntegerField()  # 1 to 5
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'doctor_ratings'
        unique_together = ('doctor', 'patient')


class EmailVerificationOTP(models.Model):
    PURPOSE_CHOICES = (
        ('registration', 'Account Registration'),
        ('password_reset', 'Password Reset'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_otps')
    otp_code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='registration')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'email_verification_otps'
        ordering = ['-created_at']

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.user.email} - {self.otp_code} ({self.purpose})"

