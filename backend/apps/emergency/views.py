from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import EmergencyRequest
from .serializers import EmergencyRequestSerializer
from apps.users.models import DoctorProfile

class EmergencyRequestCreateListView(generics.ListCreateAPIView):
    serializer_class = EmergencyRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return EmergencyRequest.objects.filter(patient=user)
        elif user.role == 'doctor':
            return EmergencyRequest.objects.filter(assigned_doctor__user=user)
        return EmergencyRequest.objects.all()

    def perform_create(self, serializer):
        # Auto assign emergency-duty doctor if available
        duty_doctor = DoctorProfile.objects.filter(
            is_approved=True, is_available_for_emergency=True
        ).first()
        if not duty_doctor:
            duty_doctor = DoctorProfile.objects.filter(is_approved=True).first()

        status_val = 'assigned' if duty_doctor else 'pending'
        serializer.save(patient=self.request.user, assigned_doctor=duty_doctor, status=status_val)


class EmergencyRequestDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = EmergencyRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EmergencyRequest.objects.all()
