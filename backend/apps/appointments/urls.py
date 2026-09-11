from django.urls import path
from .views import (
    AppointmentListCreateView, AppointmentDetailView, 
    AppointmentRoomView, ConsultationNoteView, PaymentConfirmView
)

urlpatterns = [
    path('', AppointmentListCreateView.as_view(), name='appointment_list_create'),
    path('<uuid:pk>/', AppointmentDetailView.as_view(), name='appointment_detail'),
    path('<uuid:pk>/room/', AppointmentRoomView.as_view(), name='appointment_room'),
    path('<uuid:appointment_id>/notes/', ConsultationNoteView.as_view(), name='consultation_notes'),
    path('<uuid:appointment_id>/pay/', PaymentConfirmView.as_view(), name='payment_confirm'),
]
