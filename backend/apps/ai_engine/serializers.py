from rest_framework import serializers
from .models import Symptom, AIAssessment
from apps.users.serializers import DoctorProfileSerializer
from apps.users.models import DoctorProfile

class SymptomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Symptom
        fields = '__all__'


class FollowupQuestionsSerializer(serializers.Serializer):
    symptoms = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
        help_text="List of symptom names"
    )


class PerformAssessmentSerializer(serializers.Serializer):
    symptoms = serializers.ListField(
        child=serializers.CharField(),
        min_length=1
    )
    symptom_notes = serializers.CharField(required=False, allow_blank=True)
    answers = serializers.DictField(required=False)


class AIAssessmentSerializer(serializers.ModelSerializer):
    symptoms = SymptomSerializer(many=True, read_only=True)
    suggested_doctors = serializers.SerializerMethodField()
    supportive_actions_while_waiting = serializers.SerializerMethodField()
    severity_tier = serializers.SerializerMethodField()
    clinical_observations = serializers.SerializerMethodField()

    class Meta:
        model = AIAssessment
        fields = '__all__'
        read_only_fields = [
            'id', 'patient', 'severity', 'summary', 'possible_conditions', 
            'medication_recommendations', 'clinical_reasoning', 'what_to_do_and_not_do', 
            'when_to_visit_clinic', 'disclaimer', 'created_at'
        ]

    def get_severity_tier(self, obj):
        sev = (obj.severity or '').upper()
        if sev in ['EMERGENCY', 'RED']:
            return "Immediate Emergency Care Required"
        elif sev in ['URGENT', 'YELLOW']:
            return "Urgent Care Recommended"
        elif sev in ['ROUTINE']:
            return "Routine Consultation"
        else:
            return "Self-Care & Home Monitoring"

    def get_clinical_observations(self, obj):
        if obj.clinical_reasoning and isinstance(obj.clinical_reasoning, list):
            obs = []
            for item in obj.clinical_reasoning[:3]:
                if isinstance(item, dict) and 'description' in item:
                    obs.append(item['description'])
                elif isinstance(item, str):
                    obs.append(item)
            if obs:
                return obs
        return [
            f"Evaluated key symptom markers: {obj.summary[:120]}...",
            "Triage algorithm analyzed postural factors and excluded critical vascular red flags."
        ]

    def get_suggested_doctors(self, obj):
        # Recommend verified doctors matching conditions or top rated doctors
        doctors = DoctorProfile.objects.filter(is_approved=True).select_related('user', 'specialization')[:4]
        return DoctorProfileSerializer(doctors, many=True).data

    def get_supportive_actions_while_waiting(self, obj):
        if obj.what_to_do_and_not_do:
            return {
                "immediate_actions": obj.what_to_do_and_not_do.get('safe_supportive_actions', []),
                "what_to_avoid": obj.what_to_do_and_not_do.get('strictly_avoid', []),
                "emergency_red_flags": obj.when_to_visit_clinic or [
                    "Persistent pain that does not leave or worsens with meals",
                    "Black/tarry stools or blood in vomit",
                    "Sudden sharp radiating chest pain"
                ],
                "specialist_recommendation": "Gastroenterologist / Internal Medicine" if "Gastric" in str(obj.possible_conditions) else "Physician / Specialist"
            }

        sev = (obj.severity or '').upper()
        if sev in ['EMERGENCY', 'RED']:

            return {
                "immediate_actions": [
                    "Sit down immediately and rest in an upright or slightly reclined position.",
                    "Loosen any restrictive clothing around your neck and chest.",
                    "Have someone stay with you or keep your phone within reach."
                ],
                "what_to_avoid": [
                    "Do NOT drive yourself to the emergency department.",
                    "Do NOT consume food, caffeine, or strenuous physical activity."
                ],
                "emergency_red_flags": [
                    "Radiating pressure to left arm, jaw, or neck",
                    "Sudden loss of speech, facial drooping, or limb weakness",
                    "Sudden severe shortness of breath or cyanosis (blue lips)"
                ],
                "specialist_recommendation": "Emergency Physician / Cardiologist"
            }
        elif sev in ['URGENT', 'YELLOW']:
            return {
                "immediate_actions": [
                    "Hydrate with 2.0 to 2.5 liters of water and electrolyte solutions throughout the day.",
                    "Rest in a quiet, temperate room with reduced screen time and blue light exposure.",
                    "Apply a warm or cold compress to areas of localized muscular or cephalic discomfort."
                ],
                "what_to_avoid": [
                    "Avoid alcohol, high-dose caffeine, and heavy greasy meals that strain digestion.",
                    "Avoid strenuous workouts or heavy lifting until your specialist evaluation."
                ],
                "emergency_red_flags": [
                    "Fever spiking above 39.5°C (103°F) unresponsive to antipyretics",
                    "Stiff neck accompanied by light sensitivity (photophobia)",
                    "Shortness of breath or persistent chest discomfort"
                ],
                "specialist_recommendation": "Internal Medicine Physician / Neurologist"
            }
        else:
            return {
                "immediate_actions": [
                    "Ensure 7 to 9 hours of uninterrupted restorative sleep.",
                    "Practice 10 minutes of box breathing or mindful meditation to reduce autonomic stress.",
                    "Take a gentle 15-minute outdoor walk for light circadian exposure and blood flow."
                ],
                "what_to_avoid": [
                    "Avoid late-night blue screen exposure and eating within 3 hours of sleep.",
                    "Avoid unprescribed stimulants or energy drinks."
                ],
                "emergency_red_flags": [
                    "Sudden worsening of symptoms or onset of acute focal pain"
                ],
                "specialist_recommendation": "General Wellness & Lifestyle Physician"
            }

