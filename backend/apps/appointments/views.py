import uuid
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Appointment, ConsultationNote, Payment
from .serializers import AppointmentSerializer, ConsultationNoteSerializer, PaymentSerializer
from apps.users.permissions import IsDoctor, IsPatient

class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return Appointment.objects.filter(patient=user).select_related('doctor__user', 'doctor__specialization')
        elif user.role == 'doctor':
            return Appointment.objects.filter(doctor__user=user).select_related('patient', 'doctor__user')
        elif user.role == 'admin' or user.is_staff:
            return Appointment.objects.all().select_related('patient', 'doctor__user')
        return Appointment.objects.none()

    def perform_create(self, serializer):
        appointment = serializer.save(patient=self.request.user)
        # Create a pending demonstration payment record automatically
        Payment.objects.create(
            appointment=appointment,
            amount=appointment.doctor.consultation_fee,
            currency='USD',
            status='pending',
            transaction_reference=f"PAY-{uuid.uuid4().hex[:10].upper()}"
        )


class AppointmentDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return Appointment.objects.filter(patient=user)
        elif user.role == 'doctor':
            return Appointment.objects.filter(doctor__user=user)
        return Appointment.objects.all()


class AppointmentRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        appointment = Appointment.objects.filter(pk=pk).first()
        if not appointment:
            return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

        # Ensure user is patient or doctor for this appointment
        if request.user != appointment.patient and request.user != appointment.doctor.user and not request.user.is_staff:
            return Response({'error': 'Unauthorized to join this video consultation.'}, status=status.HTTP_403_FORBIDDEN)

        room_url = f"https://meet.jit.si/{appointment.jitsi_room_name}"
        return Response({
            'room_name': appointment.jitsi_room_name,
            'room_url': room_url,
            'patient_name': appointment.patient.full_name,
            'doctor_name': appointment.doctor.user.full_name,
            'appointment_id': str(appointment.id),
        })


class ConsultationNoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, appointment_id):
        appointment = Appointment.objects.filter(id=appointment_id).first()
        if not appointment:
            return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        note = getattr(appointment, 'consultation_note', None)
        if not note:
            return Response({'error': 'No consultation note found'}, status=status.HTTP_404_NOT_FOUND)

        # If patient, verify shared flag
        if request.user == appointment.patient and not note.shared_with_patient:
            return Response({'error': 'Consultation note has not been shared by doctor yet.'}, status=status.HTTP_403_FORBIDDEN)

        return Response(ConsultationNoteSerializer(note).data)

    def post(self, request, appointment_id):
        appointment = Appointment.objects.filter(id=appointment_id).first()
        if not appointment:
            return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user != appointment.doctor.user:
            return Response({'error': 'Only the assigned doctor can add consultation notes.'}, status=status.HTTP_403_FORBIDDEN)

        note, created = ConsultationNote.objects.update_or_create(
            appointment=appointment,
            defaults={
                'diagnosis': request.data.get('diagnosis', ''),
                'subjective': request.data.get('subjective', ''),
                'objective': request.data.get('objective', ''),
                'assessment_plan': request.data.get('assessment_plan', ''),
                'prescription': request.data.get('prescription', ''),
                'shared_with_patient': request.data.get('shared_with_patient', True),
            }
        )
        # Mark appointment completed
        appointment.status = 'completed'
        appointment.save()

        return Response(ConsultationNoteSerializer(note).data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


class PaymentConfirmView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, appointment_id):
        payment = Payment.objects.filter(appointment_id=appointment_id).first()
        if not payment:
            return Response({'error': 'Payment record not found'}, status=status.HTTP_404_NOT_FOUND)

        payment.status = 'completed'
        payment.save()

        # Update appointment status to confirmed
        appointment = payment.appointment
        appointment.status = 'confirmed'
        appointment.save()

        return Response({'message': 'Payment confirmed successfully!', 'payment': PaymentSerializer(payment).data})
