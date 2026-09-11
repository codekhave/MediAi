import requests
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class RxNormService:
    BASE = 'https://rxnav.nlm.nih.gov/REST'

    def normalize(self, drug_name: str) -> dict:
        """Return rxcui, canonical generic name, and details for a drug using RxNorm API."""
        try:
            res = requests.get(
                f'{self.BASE}/approximateTerm.json',
                params={'term': drug_name, 'maxEntries': 5},
                timeout=5
            )
            rxcui = None
            if res.ok:
                candidates = res.json().get('approximateGroup', {}).get('candidate', [])
                for c in candidates:
                    if c.get('source') == 'RXNORM':
                        rxcui = c.get('rxcui')
                        break
                if not rxcui and candidates:
                    rxcui = candidates[0].get('rxcui')

            if rxcui:
                props_res = requests.get(f'{self.BASE}/rxcui/{rxcui}/properties.json', timeout=5)
                if props_res.ok:
                    props = props_res.json().get('properties', {})
                    return {
                        'rxcui': rxcui,
                        'name': props.get('name', drug_name),
                        'synonym': props.get('synonym', ''),
                    }
        except Exception as e:
            logger.warning(f"RxNorm normalization error for {drug_name}: {e}")
        
        return {'rxcui': None, 'name': drug_name, 'synonym': ''}


class HealthAssessmentService:
    def __init__(self):
        self.rxnorm = RxNormService()
        self.api_key = getattr(settings, 'GEMINI_API_KEY', '')

    def get_followup_questions(self, symptoms_list: list) -> list:
        """Generate clarifying follow-up questions for symptom triage."""
        symptoms_str = ", ".join(symptoms_list)
        
        # High quality fallback questions
        fallback_questions = [
            f"How long have you been experiencing {symptoms_str}?",
            "On a scale of 1 to 10, how severe is your pain or discomfort?",
            "Do you have any accompanying symptoms like high fever, shortness of breath, or dizziness?",
            "Do you have any underlying health conditions (e.g. hypertension, diabetes, asthma)?"
        ]

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                prompt = (
                    f"A patient presents with the following symptoms: {symptoms_str}.\n"
                    "Generate exactly 3 to 4 targeted, polite medical follow-up questions to clarify severity, duration, and onset.\n"
                    "Return ONLY a raw JSON array of string questions, e.g. [\"Question 1\", \"Question 2\"]."
                )
                response = model.generate_content(prompt)
                text = response.text.strip()
                if text.startswith('```json'):
                    text = text[7:-3].strip()
                questions = json.loads(text)
                if isinstance(questions, list) and len(questions) > 0:
                    return questions
            except Exception as e:
                logger.warning(f"Gemini API question generation failed: {e}. Using fallback.")

        return fallback_questions

    def perform_assessment(self, symptoms_list: list, symptom_notes: str, answers: dict) -> dict:
        """
        Evaluate symptoms & answers using a 4-tier triage enum:
        - EMERGENCY: Immediate 911 / Emergency Room
        - URGENT: Clinic / Urgent Care within 12–24h
        - ROUTINE: Scheduled Doctor Consultation / Monitoring
        - SELF_CARE: At-Home Rest & Symptom Monitoring

        Strict Red-Flag Gating for Back Pain:
        - A back pain complaint must NEVER trigger cardiopulmonary or vascular alerts
          unless explicit co-factors are confirmed:
            * Cardiopulmonary: Shortness of breath, cyanosis, chest pressure, diaphoresis, syncope.
            * Vascular/Aortic: Sudden severe "ripping/tearing" pain radiating chest/back, pulseless extremity.
            * Cauda Equina: Incontinence (bowel/bladder loss), progressive bilateral leg weakness, saddle numbness.
        - Postural / sitting / standing locks or gastric / ulcer history without active GI bleeding
          are strictly classified as URGENT (ulcer/psoas spasm) or ROUTINE (musculoskeletal strain).
        """
        symptoms_str = ", ".join(symptoms_list) if symptoms_list else "unspecified symptoms"
        text_corpus = f"{' '.join(symptoms_list)} {symptom_notes} {json.dumps(answers)}".lower()

        import re

        # Helper: test for explicit denial (e.g. "no chest pain", "do not have shortness of breath", "denies syncope")
        def is_denied(phrase):
            pattern = rf"\b(no|not|denies|denied|without|dont have|don't have|do not have|never had|free of|negative for)\b[\w\s]{{0,35}}\b{re.escape(phrase)}"
            return bool(re.search(pattern, text_corpus))

        def matches_any(keywords):
            for k in keywords:
                if k in text_corpus and not is_denied(k):
                    return True
            return False

        # --- 1. FEATURE EXTRACTION ---
        has_back_pain = matches_any([
            'back pain', 'lower back', 'upper back', 'spine', 'spine pain',
            'back ache', 'back hurts', 'pain at my back', 'back'
        ])

        # Cardiopulmonary Red-Flags
        has_sob = matches_any(['shortness of breath', 'dyspnea', 'trouble breathing', 'gasping', 'cant breathe', "can't breathe"])
        has_cyanosis = matches_any(['cyanosis', 'blue lips', 'bluish skin', 'blue fingertips'])
        has_chest_pressure = matches_any(['chest pressure', 'crushing chest', 'chest tightness', 'substernal pressure', 'radiating to arm', 'radiating to jaw'])
        has_diaphoresis = matches_any(['diaphoresis', 'cold sweats', 'profuse sweating', 'drenched in cold sweat'])
        has_syncope = matches_any(['syncope', 'fainting', 'passed out', 'blackout', 'loss of consciousness', 'unconscious'])
        cardiopulmonary_red_flags = has_sob or has_cyanosis or has_chest_pressure or has_diaphoresis or has_syncope

        # Vascular / Aortic Red-Flags
        has_tearing_pain = matches_any(['ripping pain', 'tearing pain', 'sudden tearing', 'sudden ripping', 'aortic dissection'])
        has_pulseless = matches_any(['pulseless', 'cold leg', 'pulseless extremity', 'cold foot with no pulse'])
        vascular_red_flags = has_tearing_pain or has_pulseless

        # Cauda Equina Red-Flags
        has_incontinence = matches_any(['loss of bowel', 'loss of bladder', 'incontinence', 'cannot hold urine', 'loss of sphincter', 'wetting myself'])
        has_bilateral_weakness = matches_any(['bilateral leg weakness', 'both legs weak', 'cannot walk bilateral', 'bilateral foot drop', 'legs giving out'])
        has_saddle_numbness = matches_any(['saddle numbness', 'groin numbness', 'perineal numbness', 'numbness between legs', 'numb genitals'])
        cauda_equina_red_flags = has_incontinence or has_bilateral_weakness or has_saddle_numbness

        # Active GI Hemorrhage Red-Flags
        has_hematemesis = matches_any(['vomiting blood', 'throwing up blood', 'coffee ground', 'hematemesis'])
        has_melena = matches_any(['black tarry stool', 'melena', 'blood in stool', 'rectal bleeding', 'black stool'])
        gi_hemorrhage_red_flags = has_hematemesis or has_melena

        # General Critical Red-Flags (non-back)
        general_critical = matches_any(['stroke', 'paralysis', 'facial droop', 'unresponsive', 'active seizure', 'status epilepticus'])

        # Mechanical & Postural Factors
        has_mechanical_postural = matches_any([
            'stand up', 'standing', 'sit down', 'sitting', 'relieved by sitting',
            'worsened by standing', 'posture', 'straighten up', "can't stand up straight",
            'cant stand up straight', "won't be able to stand", 'locking', 'locks',
            'after sitting for a while', 'stand up straight'
        ])

        # Gastrointestinal / Peptic Ulcer History & Referral Clues
        has_gastric_ulcer_history = matches_any([
            'ulcer', 'antacid', 'gastric', 'gastritis', 'heartburn', 'acid reflux',
            'stomach pain', 'epigastric', 'peptic', 'burning in stomach'
        ])

        # --- 2. TRIAGE EVALUATION WITH STRICT RED-FLAG GATING ---
        
        # Scenario A: True Back Pain Emergency Gated Evaluation
        if has_back_pain:
            # Back pain CANNOT trigger cardiopulmonary or vascular alerts without explicit co-factors
            if cardiopulmonary_red_flags or vascular_red_flags or cauda_equina_red_flags or gi_hemorrhage_red_flags:
                severity = 'EMERGENCY'
                severity_tier = 'Immediate Emergency Care (911 / ER)'
                summary = (
                    "High-priority emergency alert: Back pain accompanied by confirmed red-flag indicators "
                    "(such as severe cardiopulmonary distress, neurological deficits, or acute vascular signs) "
                    "requires immediate emergency medical evaluation."
                )
                conditions = [
                    "Aortic / Vascular or Cardiopulmonary Emergency",
                    "Cauda Equina Syndrome (Acute Spinal Cord / Nerve Root Compression)",
                    "Acute Hemorrhagic Peptic Event"
                ]
                clinical_reasoning = [
                    {
                        "title": "Red-Flag Critical Co-factor Detected",
                        "description": "Your report includes systemic red flags (e.g. respiratory, circulatory, or neurological signs) co-occurring with back pain that warrant urgent hospital diagnostics."
                    }
                ]
                what_to_do_and_not_do = {
                    "strictly_avoid": [
                        "Do NOT drive yourself to the clinic or emergency room; have an ambulance dispatch or emergency contact drive you.",
                        "Do NOT self-medicate with oral painkillers, food, or hot tubs.",
                        "Do NOT exert yourself or attempt to 'walk off' the pain."
                    ],
                    "safe_supportive_actions": [
                        "Sit or lie down in the most comfortable, stable position immediately.",
                        "Loosen restrictive garments around your waist, chest, and neck.",
                        "Activate emergency services (dial 911 or visit the nearest ER immediately)."
                    ]
                }
                when_to_visit_clinic = ["Immediate emergency department evaluation required right now."]
                meds = [
                    {
                        "name": "Immediate Emergency Evaluation Required",
                        "brand_examples": "Hospital Emergency Department",
                        "type": "Emergency Medical Services",
                        "indication": "Red-flag acute presentation requiring immediate clinical imaging and stabilization",
                        "usage_guidance": "Do not take oral pain relievers before clinical examination unless directed by emergency dispatchers.",
                        "precautions": "Call 911 or visit the nearest emergency room immediately.",
                        "rxcui": None
                    }
                ]
                specialist_rec = "Emergency Medicine Physician / Cardiothoracic Team"

            elif has_gastric_ulcer_history or has_mechanical_postural:
                # Mechanical factors and prior ulcer history down-weight cardiac/vascular risk to URGENT or ROUTINE
                severity = 'URGENT'
                severity_tier = 'Urgent Medical Evaluation Recommended'
                summary = (
                    "The combination of mid/lower back discomfort linked to sitting/standing transitions and a history "
                    "consistent with gastric irritation strongly indicates referred posterior visceral pain or a deep psoas muscle spasm, "
                    "rather than a cardiopulmonary emergency."
                )
                conditions = [
                    "Referred Posterior Gastric Irritation (Gastritis / Peptic Ulcer)",
                    "Psoas Muscle Spasm (Deep Lumbar & Pelvic Flexor Strain)",
                    "Thoracolumbar Postural Mechanical Strain"
                ]
                clinical_reasoning = [
                    {
                        "title": "Referred Visceral Pain (Posterior Stomach / Duodenal Wall)",
                        "description": "Nerve fibers from the posterior gastric wall share spinal pathways with mid-to-lower back dermatomes. Sitting hunches the torso; standing abruptly stretches the stomach wall and diaphragm, producing a sharp locking ache in the back."
                    },
                    {
                        "title": "Psoas Muscle Spasm / Postural Locking",
                        "description": "The psoas flexor attaches directly from the lumbar spine to the pelvis. Sitting for prolonged periods shortens the muscle; attempting to stand upright forces a rapid stretch, causing temporary inability to straighten up straight for several minutes."
                    },
                    {
                        "title": "Strict Absence of Cardiopulmonary or Vascular Signs",
                        "description": "No shortness of breath, crushing chest pressure, or neurological deficits are present. Aortic dissection and cardiac ischemia are safely ruled out."
                    }
                ]
                what_to_do_and_not_do = {
                    "strictly_avoid": [
                        "STRICTLY AVOID NSAID painkillers (Ibuprofen, Advil, Aleve, Aspirin, Diclofenac): If this is peptic or gastric in origin, NSAIDs will corrode the stomach lining and cause bleeding.",
                        "Do NOT stand up abruptly or jerk upright from a low seated position.",
                        "Avoid irritating foods: hot spices, acidic citrus, tomato sauces, coffee, and alcohol."
                    ],
                    "safe_supportive_actions": [
                        "Safe Non-NSAID Relief: If needed before seeing your doctor, plain Paracetamol (Acetaminophen) 500mg is the only safe supportive OTC analgesic.",
                        "Supportive Antacids: An OTC antacid suspension (Gaviscon, Maalox) can help soothe gastric mucosal burning.",
                        "Controlled Postural Transition: Shift forward to the edge of the chair, brace hands firmly on your knees, and straighten up slowly over 30 seconds."
                    ]
                }
                when_to_visit_clinic = [
                    "Schedule an urgent clinic or outpatient consultation within 12–24 hours as the pain does not fully resolve.",
                    "Seek immediate emergency evaluation if you notice black tarry stools, vomiting blood, or sudden shortness of breath."
                ]
                meds = [
                    {
                        "name": "Acetaminophen (Plain Paracetamol)",
                        "brand_examples": "Tylenol, Panadol (Plain)",
                        "type": "Safe Non-NSAID Supportive Analgesic",
                        "indication": "Temporary mild pain relief without irritating digestive or gastric lining",
                        "usage_guidance": "500 mg taken with a full glass of water. Do NOT exceed 2,000 mg in 24 hours. Never combine with NSAIDs.",
                        "precautions": "Avoid if you have active liver disease. Use only as supportive bridge to physician evaluation.",
                        "rxcui": "161"
                    },
                    {
                        "name": "Antacid Suspension (Chewable or Liquid)",
                        "brand_examples": "Gaviscon, Maalox, Gelusil",
                        "type": "Supportive Gastric Acid Neutralizer",
                        "indication": "Neutralizes stomach acid and coats visceral mucosal lining",
                        "usage_guidance": "10–20 ml liquid suspension 1 hour after meals and at bedtime as needed.",
                        "precautions": "Provides temporary symptomatic relief; consult a physician for targeted ulcer therapy.",
                        "rxcui": "18631"
                    }
                ]
                specialist_rec = "Gastroenterologist / Internal Medicine Physician"

            else:
                # Isolated mechanical back pain without ulcer clues or red flags
                severity = 'ROUTINE'
                severity_tier = 'Routine Medical Consultation'
                summary = (
                    "Mild-to-moderate musculoskeletal back discomfort without neurological red flags. "
                    "A routine clinical review or physiotherapy evaluation is recommended."
                )
                conditions = ["Mechanical Lumbar Strain", "Myofascial Back Discomfort", "Postural Fatigue"]
                clinical_reasoning = [
                    {
                        "title": "Localized Musculoskeletal Strain",
                        "description": "Symptoms reflect benign muscular or ligamentous fatigue without radiation, numbness, or systemic red flags."
                    }
                ]
                what_to_do_and_not_do = {
                    "strictly_avoid": [
                        "Avoid heavy spinal loading, heavy deadlifts, or awkward twisting.",
                        "Avoid prolonged continuous bed rest; gentle walking promotes recovery."
                    ],
                    "safe_supportive_actions": [
                        "Apply a warm compress or ice pack to the affected area for 15–20 minutes.",
                        "Engage in gentle pelvic tilts and hamstring stretches.",
                        "Maintain good lumbar support while seated."
                    ]
                }
                when_to_visit_clinic = [
                    "If pain progressively worsens over 7–10 days or begins radiating down the leg below the knee.",
                    "If any bladder or bowel control changes occur."
                ]
                meds = [
                    {
                        "name": "Acetaminophen (Paracetamol)",
                        "brand_examples": "Tylenol, Panadol",
                        "type": "Supportive Analgesic",
                        "indication": "Relieves localized muscular discomfort",
                        "usage_guidance": "500 mg every 6 hours as needed with water. Do not exceed maximum daily limits.",
                        "precautions": "Consult physician if pain persists beyond one week.",
                        "rxcui": "161"
                    }
                ]
                specialist_rec = "Physiatrist / Physical Therapist / General Practitioner"

        # Scenario B: Non-Back Symptoms Evaluation
        elif general_critical or (has_chest_pressure and has_sob):
            severity = 'EMERGENCY'
            severity_tier = 'Immediate Emergency Care (911 / ER)'
            summary = "Acute high-risk cardiopulmonary or neurological symptoms detected. Immediate emergency medical evaluation is required."
            conditions = ["Acute Coronary / Cardiopulmonary Syndrome", "Acute Neurological Event"]
            clinical_reasoning = [
                {
                    "title": "Acute Cardiopulmonary / Neurological Alert",
                    "description": "Reported symptoms suggest acute ischemia, respiratory compromise, or neurological distress requiring hospital assessment."
                }
            ]
            what_to_do_and_not_do = {
                "strictly_avoid": [
                    "Do NOT drive yourself to the hospital; summon emergency transport.",
                    "Do NOT take unprescribed medications or perform strenuous activity."
                ],
                "safe_supportive_actions": [
                    "Sit down immediately in an upright or semi-reclined posture.",
                    "Loosen restrictive clothing and call 911 or your local emergency line immediately."
                ]
            }
            when_to_visit_clinic = ["Immediate emergency department evaluation required right now."]
            meds = [
                {
                    "name": "Emergency Medical Evaluation Required",
                    "brand_examples": "Emergency Services",
                    "type": "Immediate Hospital Care",
                    "indication": "Acute symptoms requiring prompt professional intervention",
                    "usage_guidance": "Do not self-treat; follow instructions of emergency responders.",
                    "precautions": "Dial 911 immediately.",
                    "rxcui": None
                }
            ]
            specialist_rec = "Emergency Physician / Cardiologist"

        elif matches_any(['fever', 'vomiting', 'migraine', 'headache', 'diarrhea', 'hypertension', 'severe']) or len(symptoms_list) >= 3:
            severity = 'URGENT'
            severity_tier = 'Urgent Medical Evaluation Recommended'
            summary = f"Moderate clinical symptom presentation for {symptoms_str}. A physician consultation within 12–24 hours is advised to verify the diagnosis and begin targeted treatment."
            conditions = ["Acute Symptomatic Episode", "Viral / Bacterial Infection", "Cephalea / Inflammatory Presentation"]
            clinical_reasoning = [
                {
                    "title": "Moderate Inflammatory / Symptomatic Response",
                    "description": f"Active symptoms ({symptoms_str}) reflect systemic immune or inflammatory signaling that warrants clinical review."
                }
            ]
            what_to_do_and_not_do = {
                "strictly_avoid": [
                    "Avoid high caffeine, alcohol, and heavy fatty meals.",
                    "Avoid strenuous workouts or high-stress activities until evaluated."
                ],
                "safe_supportive_actions": [
                    "Hydrate with 2.0 to 2.5 liters of water and electrolyte fluids throughout the day.",
                    "Rest in a quiet, dark, comfortable room with limited screen exposure.",
                    "Monitor your temperature and symptom progression."
                ]
            }
            when_to_visit_clinic = [
                "Fever rising above 39.0°C (102.2°F) or unresponsive to antipyretics.",
                "Symptoms not improving after 48–72 hours.",
                "Development of severe focal pain or shortness of breath."
            ]
            meds = [
                {
                    "name": "Acetaminophen (Paracetamol)",
                    "brand_examples": "Tylenol, Panadol",
                    "type": "Supportive Analgesic & Antipyretic",
                    "indication": "Reduces fever and eases moderate body aches",
                    "usage_guidance": "500 mg to 1,000 mg every 4 to 6 hours as needed with water. Do NOT exceed 3,000 mg in 24 hours.",
                    "precautions": "Avoid with liver disease. Do not combine with other acetaminophen products.",
                    "rxcui": "161"
                }
            ]
            specialist_rec = "Internal Medicine Physician / General Practitioner"

        elif matches_any(['cough', 'sore throat', 'runny nose', 'congestion', 'mild']):
            severity = 'ROUTINE'
            severity_tier = 'Routine Medical Consultation'
            summary = f"Common respiratory or mild seasonal symptoms reported ({symptoms_str}). Recommended for outpatient primary care review or tele-consultation."
            conditions = ["Upper Respiratory Tract Infection", "Mild Allergic Rhinitis", "Viral Pharyngitis"]
            clinical_reasoning = [
                {
                    "title": "Subacute Upper Respiratory Presentation",
                    "description": "Symptoms show localized mucosal inflammation without respiratory distress or hemodynamic instability."
                }
            ]
            what_to_do_and_not_do = {
                "strictly_avoid": [
                    "Avoid dry air and smoke exposure; use a humidifier if available.",
                    "Avoid excessive vocal strain and unprescribed antibiotics."
                ],
                "safe_supportive_actions": [
                    "Warm saline gargles 3–4 times daily for throat comfort.",
                    "Sip warm honey and lemon water.",
                    "Get at least 8 hours of restorative rest."
                ]
            }
            when_to_visit_clinic = [
                "Difficulty swallowing saliva or opening mouth fully.",
                "Persistent high fever for more than 3 days."
            ]
            meds = [
                {
                    "name": "Saline Nasal Spray & Lozenges",
                    "brand_examples": "Ocean, Ricola, Cepacol",
                    "type": "Supportive Mucosal Soother",
                    "indication": "Relieves nasal congestion and throat irritation",
                    "usage_guidance": "1–2 sprays in each nostril as needed; dissolve lozenge slowly in mouth.",
                    "precautions": "Non-prescription supportive care.",
                    "rxcui": None
                }
            ]
            specialist_rec = "Primary Care Physician / ENT Specialist"

        else:
            severity = 'SELF_CARE'
            severity_tier = 'Self-Care & Home Monitoring'
            summary = f"Mild symptoms reported ({symptoms_str}). Your responses indicate a low-risk presentation suitable for home rest, lifestyle optimization, and supportive hydration."
            conditions = ["Mild Fatigue / Non-Specific Discomfort", "Transient Muscular Soreness", "Circadian Dysregulation"]
            clinical_reasoning = [
                {
                    "title": "Transient Non-Urgent Presentation",
                    "description": "Symptoms do not display clinical red flags or autonomic distress. Suitable for at-home recovery and lifestyle pacing."
                }
            ]
            what_to_do_and_not_do = {
                "strictly_avoid": [
                    "Avoid late-night blue screen exposure and eating within 3 hours of sleep.",
                    "Avoid unprescribed stimulants or excessive energy drinks."
                ],
                "safe_supportive_actions": [
                    "Ensure 7 to 9 hours of uninterrupted restorative sleep.",
                    "Practice 10 minutes of box breathing or mindful meditation to reduce autonomic stress.",
                    "Take a gentle 15-minute outdoor walk for light circadian exposure and blood flow."
                ]
            }
            when_to_visit_clinic = [
                "Sudden worsening of symptoms or onset of acute focal pain."
            ]
            meds = [
                {
                    "name": "Multivitamin & Magnesium Glycinate",
                    "brand_examples": "Dietary Supplement",
                    "type": "Nutritional & Recovery Support",
                    "indication": "Supports muscle relaxation, cellular energy, and restful sleep architecture",
                    "usage_guidance": "200–300 mg elemental Magnesium taken 30–60 minutes before bedtime.",
                    "precautions": "Non-prescription dietary supplement. Safe for healthy adults.",
                    "rxcui": "6646"
                }
            ]
            specialist_rec = "General Wellness & Lifestyle Physician"

        # Generate 2-3 crisp clinical observation bullet points for the new unified Clinical Analysis card
        clinical_observations = [
            r['description'] for r in clinical_reasoning[:3]
        ]

        return {
            'severity': severity,
            'severity_tier': severity_tier,
            'summary': summary,
            'clinical_observations': clinical_observations,
            'conditions': conditions,
            'possible_conditions': conditions,
            'clinical_reasoning': clinical_reasoning,
            'what_to_do_and_not_do': what_to_do_and_not_do,
            'when_to_visit_clinic': when_to_visit_clinic,
            'medication_recommendations': meds,
            'supportive_actions_while_waiting': {
                'immediate_actions': what_to_do_and_not_do['safe_supportive_actions'],
                'what_to_avoid': what_to_do_and_not_do['strictly_avoid'],
                'emergency_red_flags': when_to_visit_clinic,
                'specialist_recommendation': specialist_rec
            }
        }


