import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message
from apps.users.models import User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_content = data.get('message', '')
        sender_id = data.get('sender_id')

        if message_content and sender_id:
            saved_msg = await self.save_message(sender_id, message_content)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': saved_msg
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def save_message(self, sender_id, content):
        conversation = Conversation.objects.filter(id=self.room_name).first()
        sender = User.objects.filter(id=sender_id).first()
        if conversation and sender:
            msg = Message.objects.create(conversation=conversation, sender=sender, content=content)
            conversation.save() # update timestamp
            return {
                'id': str(msg.id),
                'conversation_id': str(conversation.id),
                'sender_id': str(sender.id),
                'sender_name': sender.full_name,
                'sender_avatar': sender.avatar,
                'content': msg.content,
                'timestamp': msg.timestamp.strftime('%H:%M'),
            }
        return {'content': content, 'sender_name': 'Unknown'}
