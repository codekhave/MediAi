from django.urls import path
from .views import MedicalDocumentListCreateView, MedicalDocumentDetailView

urlpatterns = [
    path('', MedicalDocumentListCreateView.as_view(), name='document_list_create'),
    path('<uuid:pk>/', MedicalDocumentDetailView.as_view(), name='document_detail'),
]
