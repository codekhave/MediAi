from rest_framework import serializers
from .models import Conversation, Message
from apps.users.serializers import UserSerializer, DoctorProfileSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_avatar = serializers.CharField(source='sender.avatar', read_only=True)
    file_url = serializers.SerializerMethodField()
    content = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_name', 'sender_avatar', 
            'content', 'file', 'file_url', 'file_type', 'file_name', 'file_size', 
            'is_read', 'timestamp'
        ]
        read_only_fields = ['id', 'conversation', 'sender', 'timestamp']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class ConversationSerializer(serializers.ModelSerializer):
    patient_detail = UserSerializer(source='patient', read_only=True)
    doctor_detail = DoctorProfileSerializer(source='doctor', read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'patient', 'doctor', 'patient_detail', 'doctor_detail', 'last_message', 'updated_at']

    def get_last_message(self, obj):
        msg = obj.messages.last()
        if msg:
            return MessageSerializer(msg).data
        return None
