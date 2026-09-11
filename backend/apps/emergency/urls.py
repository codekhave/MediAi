from django.urls import path
from .views import EmergencyRequestCreateListView, EmergencyRequestDetailView

urlpatterns = [
    path('', EmergencyRequestCreateListView.as_view(), name='emergency_list_create'),
    path('<uuid:pk>/', EmergencyRequestDetailView.as_view(), name='emergency_detail'),
]
