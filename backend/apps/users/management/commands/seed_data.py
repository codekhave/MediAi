from django.core.management.base import BaseCommand
from apps.users.models import User, Specialization, DoctorProfile, PatientProfile
from apps.ai_engine.models import Symptom

class Command(BaseCommand):
    help = 'Seeds initial specializations, symptoms, and demo users'

    def handle(self, *args, **options):
        self.stdout.write('Seeding initial MediAI data...')

        # 1. Specializations
        specs = [
            ('General Medicine', 'Primary care and internal health', 'Stethoscope'),
            ('Cardiology', 'Heart and blood vessel disorders', 'Heart'),
            ('Neurology', 'Brain, spinal cord, and nerve health', 'Brain'),
            ('Pediatrics', 'Child and infant healthcare', 'Baby'),
            ('Dermatology', 'Skin, hair, and nail conditions', 'Sparkles'),
            ('Orthopedics', 'Bones, joints, and muscular health', 'Activity'),
            ('Psychiatry', 'Mental health and emotional wellbeing', 'Smile'),
            ('Gynecology', 'Womens reproductive and pelvic health', 'ShieldAlert'),
        ]
        created_specs = {}
        for name, desc, icon in specs:
            spec_obj, _ = Specialization.objects.get_or_create(
                name=name,
                defaults={'description': desc, 'icon': icon}
            )
            created_specs[name] = spec_obj

        self.stdout.write(f'Created {len(created_specs)} specializations.')

        # 2. Symptoms
        symptoms_data = [
            ('Fever', 'Elevated body temperature above 37.5 C', 'General'),
            ('Headache', 'Pain or pressure in the head or neck area', 'Neurology'),
            ('Chest Pain', 'Discomfort, tightness, or pressure in chest area', 'Cardiology'),
            ('Shortness of Breath', 'Difficulty breathing or panting', 'Cardiology'),
            ('Persistent Cough', 'Dry or productive cough lasting days', 'Respiratory'),
            ('Abdominal Pain', 'Cramping or pain in stomach region', 'Gastroenterology'),
            ('Skin Rash', 'Redness, itching, or eruption on skin', 'Dermatology'),
            ('Joint Pain', 'Aching or swelling in joints', 'Orthopedics'),
            ('Fatigue', 'Unusual tiredness or lack of energy', 'General'),
            ('Dizziness', 'Feeling lightheaded, unsteady, or faint', 'Neurology'),
            ('Sore Throat', 'Irritation or pain when swallowing', 'Respiratory'),
            ('Nausea', 'Feeling of sickness with urge to vomit', 'Gastroenterology'),
        ]
        for name, desc, cat in symptoms_data:
            Symptom.objects.get_or_create(name=name, defaults={'description': desc, 'category': cat})

        self.stdout.write('Created symptoms database.')

        # 3. Demo Admin User
        admin_user, admin_created = User.objects.get_or_create(
            email='admin@mediai.com',
            defaults={
                'first_name': 'System',
                'last_name': 'Administrator',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_email_verified': True
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()
        self.stdout.write('Configured Admin user: admin@mediai.com / admin123')

        # 4. Demo Doctor User
        doc_user, doc_created = User.objects.get_or_create(
            email='doctor@mediai.com',
            defaults={
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'role': 'doctor',
                'is_email_verified': True,
                'avatar': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300'
            }
        )
        doc_user.set_password('doctor123')
        doc_user.save()
        if doc_created or not hasattr(doc_user, 'doctor_profile'):
            DoctorProfile.objects.get_or_create(
                user=doc_user,
                defaults={
                    'specialization': created_specs['Cardiology'],
                    'licence_number': 'MD-CARDIO-8890',
                    'years_of_experience': 12,
                    'bio': 'Consultant Cardiologist specializing in preventive heart health and tele-cardiology.',
                    'consultation_fee': 75.00,
                    'hospital_affiliation': 'St. Jude Heart Institute',
                    'is_verified': True,
                    'is_approved': True,
                    'is_available_for_emergency': True,
                    'rating': 4.9,
                    'total_reviews': 28
                }
            )
        self.stdout.write('Configured Doctor user: doctor@mediai.com / doctor123')

        # 5. Demo Patient User
        pat_user, pat_created = User.objects.get_or_create(
            email='patient@mediai.com',
            defaults={
                'first_name': 'Daniel',
                'last_name': 'Echo',
                'role': 'patient',
                'is_email_verified': True,
                'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'
            }
        )
        pat_user.set_password('patient123')
        pat_user.save()
        if pat_created or not hasattr(pat_user, 'patient_profile'):
            PatientProfile.objects.get_or_create(
                user=pat_user,
                defaults={
                    'blood_group': 'O+',
                    'allergies': 'Penicillin',
                    'chronic_conditions': 'Mild Asthma'
                }
            )
        self.stdout.write('Configured Patient user: patient@mediai.com / patient123')
        self.stdout.write(self.style.SUCCESS('MediAI database seeded successfully!'))
