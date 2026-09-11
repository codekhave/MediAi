from django.urls import path
from .views import ConversationListCreateView, MessageListCreateView

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversations'),
    path('conversations/<uuid:conversation_id>/messages/', MessageListCreateView.as_view(), name='messages'),
]
