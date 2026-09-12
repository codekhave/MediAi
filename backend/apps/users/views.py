import uuid
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import User, Specialization, PatientProfile, DoctorProfile, DoctorAvailability, DoctorRating, DoctorDocument
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    SpecializationSerializer, PatientProfileSerializer, DoctorProfileSerializer,
    DoctorAvailabilitySerializer, DoctorRatingSerializer, DoctorDocumentSerializer,
    VerifyOTPSerializer, ResendOTPSerializer, ForgotPasswordSerializer, ResetPasswordOTPSerializer
)
from .permissions import IsAdmin, IsDoctor


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        dev_otp = getattr(user, '_dev_otp', None)
        return Response({
            'message': 'Registration successful! A 6-digit clinical verification code has been dispatched to your email.',
            'email': user.email,
            'role': user.role,
            'requires_otp': True,
            'dev_otp': dev_otp,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class ResendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class ResetPasswordOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_serializer = UserSerializer(request.user)
        data = user_serializer.data

        if request.user.role == 'patient':
            profile = PatientProfile.objects.filter(user=request.user).first()
            if profile:
                data['profile'] = PatientProfileSerializer(profile).data
        elif request.user.role == 'doctor':
            profile = DoctorProfile.objects.filter(user=request.user).first()
            if profile:
                data['profile'] = DoctorProfileSerializer(profile).data

        return Response(data)

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Update profile if passed
        if user.role == 'patient' and 'patient_profile' in request.data:
            profile = PatientProfile.objects.filter(user=user).first()
            if profile:
                p_serializer = PatientProfileSerializer(profile, data=request.data['patient_profile'], partial=True)
                p_serializer.is_valid(raise_exception=True)
                p_serializer.save()
        elif user.role == 'doctor' and 'doctor_profile' in request.data:
            profile = DoctorProfile.objects.filter(user=user).first()
            if profile:
                d_serializer = DoctorProfileSerializer(profile, data=request.data['doctor_profile'], partial=True)
                d_serializer.is_valid(raise_exception=True)
                d_serializer.save()

        return self.get(request)


class SpecializationListView(generics.ListCreateAPIView):
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.AllowAny()]


class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = DoctorProfile.objects.select_related('user', 'specialization').filter(is_approved=True)
        
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) | 
                Q(user__last_name__icontains=search) |
                Q(specialization__name__icontains=search) |
                Q(hospital_affiliation__icontains=search)
            )

        spec = self.request.query_params.get('specialization', '')
        if spec:
            queryset = queryset.filter(specialization__id=spec)

        emergency = self.request.query_params.get('emergency', '')
        if emergency.lower() == 'true':
            queryset = queryset.filter(is_available_for_emergency=True)

        return queryset


class DoctorDetailView(generics.RetrieveAPIView):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.AllowAny]


class DoctorVerifyView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        doctor = DoctorProfile.objects.filter(pk=pk).first()
        if not doctor:
            return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)

        is_approved = request.data.get('is_approved', True)
        doctor.is_approved = is_approved
        doctor.is_verified = is_approved
        doctor.save()

        return Response({'message': f'Doctor approval set to {is_approved}', 'doctor': DoctorProfileSerializer(doctor).data})


class DoctorAvailabilityView(APIView):
    permission_classes = [IsDoctor]

    def get(self, request):
        profile = DoctorProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
        availabilities = DoctorAvailability.objects.filter(doctor=profile)
        return Response(DoctorAvailabilitySerializer(availabilities, many=True).data)

    def post(self, request):
        profile = DoctorProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        day_of_week = request.data.get('day_of_week')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')

        availability, created = DoctorAvailability.objects.update_or_create(
            doctor=profile,
            day_of_week=day_of_week,
            start_time=start_time,
            defaults={'end_time': end_time, 'is_available': True}
        )
        return Response(DoctorAvailabilitySerializer(availability).data, status=status.HTTP_201_CREATED)


class AdminDoctorListView(generics.ListAPIView):
    """Admin-only view to list ALL doctors regardless of approval status."""
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return DoctorProfile.objects.select_related('user', 'specialization').all()


class AdminUserListView(generics.ListAPIView):
    """Admin-only view to list all platform users."""
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        role = self.request.query_params.get('role', '')
        qs = User.objects.all()
        if role:
            qs = qs.filter(role=role)
        return qs


class PatientListView(generics.ListAPIView):
    """View to list patients for clinical consultations (accessible by authenticated doctors and patients)."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(role='patient').order_by('first_name', 'last_name')



class DoctorDocumentUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        doctor = DoctorProfile.objects.filter(user=request.user).first()
        doctor_id = request.query_params.get('doctor_id')
        if (request.user.is_staff or request.user.role == 'admin') and doctor_id:
            doctor = DoctorProfile.objects.filter(id=doctor_id).first()

        if not doctor:
            return Response([])

        docs = DoctorDocument.objects.filter(doctor=doctor)
        return Response(DoctorDocumentSerializer(docs, many=True).data)

    def post(self, request):
        doctor = DoctorProfile.objects.filter(user=request.user).first()
        if not doctor:
            if request.user.role == 'doctor':
                doctor = DoctorProfile.objects.create(
                    user=request.user,
                    licence_number=f"DOC-PENDING-{uuid.uuid4().hex[:6].upper()}"
                )
            else:
                return Response({'error': 'Only doctors and specialists can upload verification documents.'}, status=status.HTTP_403_FORBIDDEN)

        document_type = request.data.get('document_type', 'licence')
        title = request.data.get('title', 'Medical Credential Certificate')
        file_url = request.data.get('file_url', '')

        uploaded_file = request.FILES.get('file')
        if uploaded_file:
            from django.core.files.storage import default_storage
            file_name = default_storage.save(f"doctor_docs/{doctor.id}_{uploaded_file.name}", uploaded_file)
            file_url = f"/media/{file_name}"
        elif not file_url:
            file_url = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"

        doc = DoctorDocument.objects.create(
            doctor=doctor,
            document_type=document_type,
            title=title,
            file_url=file_url
        )

        return Response(DoctorDocumentSerializer(doc).data, status=status.HTTP_201_CREATED)

