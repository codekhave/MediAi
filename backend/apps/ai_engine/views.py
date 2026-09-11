from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import UserRateThrottle
from .models import Symptom, AIAssessment
from .serializers import SymptomSerializer, FollowupQuestionsSerializer, PerformAssessmentSerializer, AIAssessmentSerializer
from .services import HealthAssessmentService
from apps.users.models import DoctorProfile
from apps.users.serializers import DoctorProfileSerializer

class AIRateThrottle(UserRateThrottle):
    scope = 'ai_assessment'

class SymptomListView(generics.ListAPIView):
    queryset = Symptom.objects.all()
    serializer_class = SymptomSerializer
    permission_classes = [permissions.IsAuthenticated]


class FollowupQuestionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [AIRateThrottle]

    def post(self, request):
        serializer = FollowupQuestionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = HealthAssessmentService()
        questions = service.get_followup_questions(serializer.validated_data['symptoms'])
        return Response({'questions': questions})


class PerformAssessmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [AIRateThrottle]

    def post(self, request):
        serializer = PerformAssessmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        symptoms_names = serializer.validated_data['symptoms']
        symptom_notes = serializer.validated_data.get('symptom_notes', '')
        answers = serializer.validated_data.get('answers', {})

        # Run assessment service
        service = HealthAssessmentService()
        result = service.perform_assessment(symptoms_names, symptom_notes, answers)

        # Save assessment model instance
        assessment = AIAssessment.objects.create(
            patient=request.user,
            symptom_notes=symptom_notes,
            follow_up_answers=answers,
            severity=result['severity'],
            summary=result['summary'],
            possible_conditions=result['possible_conditions'],
            medication_recommendations=result['medication_recommendations'],
            clinical_reasoning=result.get('clinical_reasoning', []),
            what_to_do_and_not_do=result.get('what_to_do_and_not_do', {}),
            when_to_visit_clinic=result.get('when_to_visit_clinic', []),
        )


        # Attach existing/created symptom instances
        for name in symptoms_names:
            symptom_obj, _ = Symptom.objects.get_or_create(name=name.title().strip())
            assessment.symptoms.add(symptom_obj)

        # Find matching doctor suggestions
        suggested_doctors = DoctorProfile.objects.filter(is_approved=True).select_related('user', 'specialization')[:4]
        doctors_data = DoctorProfileSerializer(suggested_doctors, many=True).data

        output = AIAssessmentSerializer(assessment).data
        output['suggested_doctors'] = doctors_data

        return Response(output, status=status.HTTP_201_CREATED)


class PatientAssessmentHistoryView(generics.ListAPIView):
    serializer_class = AIAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIAssessment.objects.filter(patient=self.request.user)
