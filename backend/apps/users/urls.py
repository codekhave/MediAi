from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, CurrentUserView, SpecializationListView,
    DoctorListView, DoctorDetailView, DoctorVerifyView, DoctorAvailabilityView,
    DoctorDocumentUploadView, AdminDoctorListView, AdminUserListView, PatientListView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('specializations/', SpecializationListView.as_view(), name='specializations'),
    path('doctors/', DoctorListView.as_view(), name='doctor_list'),
    path('patients/', PatientListView.as_view(), name='patient_list'),
    path('doctors/<uuid:pk>/', DoctorDetailView.as_view(), name='doctor_detail'),
    path('doctors/<uuid:pk>/verify/', DoctorVerifyView.as_view(), name='doctor_verify'),
    path('doctor/documents/', DoctorDocumentUploadView.as_view(), name='doctor_documents'),
    path('doctor/availabilities/', DoctorAvailabilityView.as_view(), name='doctor_availabilities'),
    # Admin-only endpoints
    path('admin/doctors/', AdminDoctorListView.as_view(), name='admin_doctor_list'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
]

