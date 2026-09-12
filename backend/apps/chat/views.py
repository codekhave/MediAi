import uuid
from rest_framework import generics, permissions, status, serializers as drf_serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from apps.users.models import DoctorProfile, User

def _resolve_doctor_profile(doctor_id):
    """Safely find a DoctorProfile by profile ID or user ID."""
    if not doctor_id:
        return None
    try:
        doc = DoctorProfile.objects.filter(id=doctor_id).first()
        if doc:
            return doc
    except Exception:
        pass

    try:
        doc = DoctorProfile.objects.filter(user__id=doctor_id).first()
        if doc:
            return doc
    except Exception:
        pass

    return None

def _resolve_patient_user(patient_id):
    """Safely find a patient User by ID or patient_profile ID."""
    if not patient_id:
        return None
    try:
        pat = User.objects.filter(id=patient_id).first()
        if pat:
            return pat
    except Exception:
        pass

    try:
        pat = User.objects.filter(patient_profile__id=patient_id).first()
        if pat:
            return pat
    except Exception:
        pass

    return None


class ConversationListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'patient':
            convs = Conversation.objects.filter(patient=user)
        elif user.role == 'doctor':
            convs = Conversation.objects.filter(doctor__user=user)
        else:
            convs = Conversation.objects.all()
        return Response(ConversationSerializer(convs, many=True).data)

    def post(self, request):
        user = request.user
        doctor_id = request.data.get('doctor_id')
        patient_id = request.data.get('patient_id')

        if user.role == 'doctor':
            doctor = DoctorProfile.objects.filter(user=user).first()
            if not doctor:
                # Auto-initialize doctor profile if not already seeded
                doctor = DoctorProfile.objects.create(
                    user=user,
                    licence_number=f"MD-{str(user.id)[:8].upper()}",
                    is_verified=True,
                    is_approved=True
                )

            patient = _resolve_patient_user(patient_id)
            if not patient:
                # If doctor didn't provide patient_id, grab the most recent patient or fail gracefully
                patient = User.objects.filter(role='patient').exclude(id=user.id).first()

            if not patient:
                return Response({'error': 'Patient not found for consultation channel'}, status=status.HTTP_404_NOT_FOUND)

            conv, created = Conversation.objects.get_or_create(patient=patient, doctor=doctor)
        else:
            # Patient initiating consultation
            doctor = _resolve_doctor_profile(doctor_id)
            if not doctor:
                # Fallback to the first available approved specialist
                doctor = DoctorProfile.objects.filter(is_approved=True).first() or DoctorProfile.objects.first()

            if not doctor:
                return Response({'error': 'No specialist is currently available for consultation'}, status=status.HTTP_404_NOT_FOUND)

            conv, created = Conversation.objects.get_or_create(patient=user, doctor=doctor)

        return Response(ConversationSerializer(conv).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conv_id = self.kwargs.get('conversation_id')
        try:
            return Message.objects.filter(conversation_id=conv_id)
        except Exception:
            return Message.objects.none()

    def perform_create(self, serializer):
        conv_id = self.kwargs.get('conversation_id')
        try:
            conv = Conversation.objects.filter(id=conv_id).first()
        except Exception:
            conv = None

        if not conv:
            raise drf_serializers.ValidationError({'error': 'Consultation conversation not found'})

        file_obj = self.request.FILES.get('file')
        file_type = self.request.data.get('file_type', '')
        file_name = self.request.data.get('file_name', '')
        file_size = self.request.data.get('file_size', '')

        if file_obj:
            if not file_name:
                file_name = file_obj.name
            if not file_type:
                ext = file_name.split('.')[-1].lower() if '.' in file_name else ''
                if ext in ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp']:
                    file_type = 'image'
                elif ext in ['mp4', 'mov', 'webm', 'mkv', 'avi']:
                    file_type = 'video'
                elif ext in ['mp3', 'wav', 'ogg', 'm4a', 'aac']:
                    file_type = 'audio'
                else:
                    file_type = 'document'
            if not file_size and hasattr(file_obj, 'size'):
                sz = file_obj.size
                if sz < 1024 * 1024:
                    file_size = f"{sz / 1024:.1f} KB"
                else:
                    file_size = f"{sz / (1024 * 1024):.1f} MB"

        msg = serializer.save(
            conversation=conv, 
            sender=self.request.user,
            file=file_obj,
            file_type=file_type,
            file_name=file_name,
            file_size=file_size
        )
        conv.save() # update updated_at timestamp

        # Broadcast via Channel Layer to WebSocket connected users
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            if channel_layer:
                serialized = MessageSerializer(msg, context={'request': self.request}).data
                async_to_sync(channel_layer.group_send)(
                    f'chat_{conv.id}',
                    {
                        'type': 'chat_message',
                        'message': serialized
                    }
                )
        except Exception:
            pass
