from django.urls import path
from .views import SymptomListView, FollowupQuestionsView, PerformAssessmentView, PatientAssessmentHistoryView

urlpatterns = [
    path('symptoms/', SymptomListView.as_view(), name='symptom_list'),
    path('questions/', FollowupQuestionsView.as_view(), name='followup_questions'),
    path('assess/', PerformAssessmentView.as_view(), name='perform_assessment'),
    path('history/', PatientAssessmentHistoryView.as_view(), name='assessment_history'),
]
