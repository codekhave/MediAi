import os
import sys
import django

# Setup django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediai_backend.settings')
django.setup()

from apps.users.models import User, Specialization, DoctorProfile
from apps.community.models import HealthArticle, CreatorProfile

def run_seed():
    print("Seeding diverse specialties and specialists...")

    # 1. Create or ensure diverse specializations
    specs_data = [
        ('Cardiology', 'Heart health, cardiovascular physiology, and blood pressure regulation', 'Heart'),
        ('Clinical Psychology & Psychotherapy', 'Cognitive behavioral therapy, emotional resilience, and neuro-stress regulation', 'Brain'),
        ('Psychiatry & Behavioral Health', 'Neurochemistry, mood disorders, and psychiatric medicine', 'Smile'),
        ('Clinical Nutrition & Dietetics', 'Evidence-based metabolic nutrition, glycemic balance, and longevity diets', 'Apple'),
        ('Physical Therapy & Sports Medicine', 'Musculoskeletal rehabilitation, exercise physiology, and movement science', 'Activity'),
        ('Neurology & Headache Medicine', 'Brain, autonomic nervous system, and sleep neurobiology', 'Zap'),
        ('Sleep & Circadian Medicine', 'Sleep architecture, circadian rhythm alignment, and hormonal health', 'Clock'),
        ('Preventive Longevity Medicine', 'Cellular repair, biomarker optimization, and preventative healthcare', 'ShieldCheck'),
    ]

    specs = {}
    for name, desc, icon in specs_data:
        spec, _ = Specialization.objects.get_or_create(
            name=name,
            defaults={'description': desc, 'icon': icon}
        )
        specs[name] = spec

    # 2. Seed Distinct Verified Specialists (Doctors, Psychologists, Therapists, Nutritionists)
    specialists_info = [
        {
            'email': 'doctor@mediai.com', # Existing demo doctor
            'first_name': 'Sarah',
            'last_name': 'Jenkins',
            'spec_name': 'Cardiology',
            'licence': 'MD-CARDIO-88219',
            'hospital': 'Johns Hopkins Hospital',
            'bio': 'Board-certified cardiologist specializing in preventive cardiovascular medicine, arterial compliance, and non-invasive hemodynamics.',
            'avatar': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
            'title': 'Board-Certified Cardiologist'
        },
        {
            'email': 'elena.rostova@mediai.com',
            'first_name': 'Elena',
            'last_name': 'Rostova',
            'spec_name': 'Clinical Psychology & Psychotherapy',
            'licence': 'PSY-CLIN-99412',
            'hospital': 'Columbia University Medical Center',
            'bio': 'Licensed Clinical Psychologist and Cognitive Behavioral Therapist specializing in somatic stress reduction, neuro-resilience, and anxiety disorders.',
            'avatar': 'https://images.unsplash.com/photo-1594824813576-69d51152d2f7?w=400&q=80',
            'title': 'Licensed Clinical Psychologist'
        },
        {
            'email': 'david.chen@mediai.com',
            'first_name': 'David',
            'last_name': 'Chen',
            'spec_name': 'Neurology & Headache Medicine',
            'licence': 'MD-NEURO-77144',
            'hospital': 'Mount Sinai Health System',
            'bio': 'Attending Neurologist and researcher investigating sleep architecture, migraine neurovascular pathways, and glymphatic waste clearance.',
            'avatar': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
            'title': 'Attending Neurologist'
        },
        {
            'email': 'maya.lin@mediai.com',
            'first_name': 'Maya',
            'last_name': 'Lin',
            'spec_name': 'Clinical Nutrition & Dietetics',
            'licence': 'RD-METAB-55321',
            'hospital': 'Stanford Preventive Health Clinic',
            'bio': 'Registered Dietitian and Clinical Nutritionist focusing on metabolic flexibility, postprandial glucose stability, and whole-food nutritional medicine across socioeconomic tiers.',
            'avatar': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
            'title': 'Clinical Dietitian & Nutritionist'
        },
        {
            'email': 'marcus.cole@mediai.com',
            'first_name': 'Marcus',
            'last_name': 'Cole',
            'spec_name': 'Physical Therapy & Sports Medicine',
            'licence': 'DPT-SPORT-44109',
            'hospital': 'US Sports Performance Center',
            'bio': 'Doctor of Physical Therapy and movement physiologist dedicated to musculoskeletal longevity, Zone 2 endurance, and metabolic remodeling through resistance stimulus.',
            'avatar': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80',
            'title': 'Doctor of Physical Therapy & Physiologist'
        },
    ]

    doctor_instances = {}
    for info in specialists_info:
        user, created = User.objects.get_or_create(
            email=info['email'],
            defaults={
                'first_name': info['first_name'],
                'last_name': info['last_name'],
                'role': 'doctor',
                'avatar': info['avatar'],
                'is_active': True,
                'is_email_verified': True
            }
        )
        if created or not user.avatar:
            user.avatar = info['avatar']
            user.set_password('doctor123')
            user.save()

        doc_profile, _ = DoctorProfile.objects.update_or_create(
            user=user,
            defaults={
                'specialization': specs[info['spec_name']],
                'licence_number': info['licence'],
                'years_of_experience': 10,
                'bio': info['bio'],
                'hospital_affiliation': info['hospital'],
                'consultation_fee': 75.00,
                'is_verified': True,
                'is_approved': True,
                'rating': 4.95,
                'total_reviews': 38
            }
        )
        doctor_instances[info['last_name']] = doc_profile

        # Ensure verified creator profile
        CreatorProfile.objects.update_or_create(
            user=user,
            defaults={
                'professional_title': info['title'],
                'bio': info['bio'],
                'is_verified': True,
                'is_monetization_approved': True,
                'verification_documents_uploaded': True,
                'payout_bank_details': 'Chase Premier Checking (Verified)'
            }
        )

    print(f"Verified {len(doctor_instances)} multidisciplinary clinical specialists.")

    # 3. Seed verified articles with distinct specialist authors
    articles = [
        # User's exact article authored by Marcus Cole, DPT
        {
            "author": doctor_instances['Cole'],
            "title": "The Physiology of Movement: How Exercise Drives Lifelong Metabolic and Cellular Health",
            "category": "fitness",
            "read_time": "3 min read",
            "cover_image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&q=80",
            "summary": "Discover how consistent physical activity acts as a potent biological catalyst to optimize cardiovascular function, regulate metabolic hormones, and shield cognitive performance. Learn evidence-based movement protocols designed to build sustainable vitality and long-term disease resistance.",
            "content": """Physical exercise is far more than a method for managing weight; it functions as a primary biochemical stimulus that drives cellular repair, regulates gene expression, and stabilizes systemic health. When skeletal muscles contract against resistance or sustain aerobic output, they act as an endocrine organ, secreting specialized signaling proteins called myokines. These molecules enter circulation to reduce systemic inflammation, optimize lipid metabolism, and sharpen glucose regulation.

### Cardiovascular and Cellular Renewal
Sustained aerobic conditioning prompts mitochondrial biogenesis—increasing both the number and efficiency of cellular powerhouses. This adaptation expands systemic oxygen uptake (VO2 max), one of the strongest clinical predictors of all-cause longevity. Exercise-induced blood flow also stimulates vascular endothelial cells to produce nitric oxide, promoting arterial dilation, improving vascular compliance, and lowering baseline blood pressure. Over time, this vascular flexibility provides robust defense against atherosclerotic plaque formation and coronary artery disease.

### Musculoskeletal Integrity and Brain Health
Resistance training creates mechanical tension that triggers osteoblast activity, progressively increasing bone mineral density to prevent osteoporosis. Preserving lean muscle mass also maintains baseline metabolic rate and protects against age-related sarcopenia. Neurologically, physical effort stimulates the release of Brain-Derived Neurotrophic Factor (BDNF), a key protein that promotes neuroplasticity, shields hippocampal neurons, and enhances mood regulation.

### Actionable Protocols for Daily Vitality
A sustainable health protocol relies on consistency across four primary movement and lifestyle targets:

- **Zone 2 Aerobic Base:** 150 minutes per week of low-to-moderate steady-state cardio (such as brisk incline walking, rowing, or cycling) where conversational breathing is maintained.
- **Resistance Stimulus:** 2 to 3 weekly sessions focusing on primary compound movements (hinges, squats, presses, and rows) to stimulate musculoskeletal remodeling.
- **Non-Exercise Activity (NEAT):** Target 7,000 to 10,000 steps daily to prevent prolonged sedentary periods and enhance peripheral insulin sensitivity.
- **Cellular Recovery:** 7 to 9 hours of restorative sleep per night alongside adequate dietary protein to support tissue synthesis and neural regeneration.

Integrating regular physical exertion with whole-food nutrition and deliberate recovery creates an enduring physiological reserve, turning daily movement into the cornerstone of preventive healthcare.""",
            "likes_count": 142
        },
        # Evidence-based nutrition by Maya Lin, RD
        {
            "author": doctor_instances['Lin'],
            "title": "Evidence-Based Nutrition: Healthy Eating Frameworks for Budget, Middle Class, and Premium Lifestyles",
            "category": "nutrition",
            "read_time": "5 min read",
            "cover_image": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=80",
            "summary": "Nutritional medicine should never be gatekept by socioeconomic status. Learn how the Healthy Eating Framework translates into high-density protein, complex fiber, and cellular protective fats across all household budgets.",
            "content": """Nutrition is the daily biochemical software we feed our cells. The Healthy Eating Plate emphasizes that half of your meal should comprise colorful vegetables and fruits, one quarter intact whole grains, and one quarter quality protein, dressed with unrefined healthy oils.

### Tier 1: The Budget & Low-Income Protocol ($2.00 - $4.00 / day)
- **High-Biological Value Proteins:** Dried brown lentils, black beans, split peas, and bulk eggs. Canned sardines or mackerel in water provide the highest density of EPA/DHA Omega-3 fatty acids per dollar in modern grocery stores.
- **Carbohydrates & Fiber:** Bulk whole rolled oats, brown rice, and seasonal root vegetables (carrots, sweet potatoes).
- **Phytonutrients:** Frozen spinach and frozen broccoli florets (nutritionally equal or superior to fresh counterparts due to flash-freezing at harvest).

### Tier 2: The Middle-Class Household Protocol ($7.00 - $12.00 / day)
- **Proteins:** Pasture-raised eggs, plain whole-milk Greek yogurt, boneless skinless poultry, and wild canned albacore tuna.
- **Fats & Oils:** Cold-pressed extra virgin olive oil as primary culinary oil, whole Hass avocados, and raw almonds.
- **Produce:** Mixed salad greens, crisp bell peppers, zucchini, and fresh seasonal antioxidant berries.

### Tier 3: The Premium & Longevity Protocol ($20.00+ / day)
- **Proteins:** Wild-caught Alaskan sockeye salmon, 100% grass-fed/grass-finished beef, and organic pastured poultry.
- **Fats & Oils:** Fresh cold-pressed avocado oil, macadamia nut oil, and raw unheated walnut halves.
- **Micro-Nutrients:** Organic sprouted quinoa, fresh microgreens, wild blueberries, and organic fermented kimchi.

### Core Clinical Rule for All Tiers
Eliminate ultra-processed seed oils and added liquid sugars. Whether eating canned lentils or wild salmon, your vascular endothelial cells thrive on whole, single-ingredient foods.""",
            "likes_count": 98
        },
        # Video Tutorial by Dr. Sarah Jenkins (Cardiology)
        {
            "author": doctor_instances['Jenkins'],
            "title": "Clinical Video Demonstration: How to Accurately Measure Blood Pressure at Home",
            "category": "videos",
            "read_time": "4 min watch",
            "cover_image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80",
            "video_url": "https://www.youtube.com/watch?v=kYJvE6LqZ8U",
            "summary": "Watch this step-by-step clinical demonstration by Dr. Sarah Jenkins on proper cuff placement, resting posture, and timing to avoid inaccurate white-coat readings and false hypertension diagnoses.",
            "content": """In clinical cardiology, up to 30% of high blood pressure readings taken at doctor offices are confounded by 'white-coat hypertension'—acute anxiety induced by the clinical environment. 

### Why Home Monitoring Matters
Serial ambulatory measurements taken in your natural resting environment offer far superior prognostic value for stroke and cardiac risk.

### Clinical Protocol Demonstrated in This Video:
1. **The 5-Minute Rest Rule:** Sit in a quiet room with feet flat on the floor and back supported for 5 full minutes before pressing start.
2. **Arm Position:** Rest your bare arm on a table at heart level. Do not hold your arm in the air or speak while measuring.
3. **Cuff Sizing:** Ensure the cuff bladder covers 80% of your upper arm circumference. A cuff that is too small falsely elevates systolic readings by 10-15 mmHg.
4. **Log Consistently:** Record two readings 1 minute apart in the morning before caffeine and two readings in the evening.

Consult with your cardiologist if your resting baseline consistently exceeds 130/80 mmHg.""",
            "likes_count": 115
        },
        # Mental Health by Dr. Elena Rostova, PhD
        {
            "author": doctor_instances['Rostova'],
            "title": "The Neurobiology of Stress: Resetting Your Autonomic Nervous System",
            "category": "mental_health",
            "read_time": "4 min read",
            "cover_image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=80",
            "summary": "Chronic sympathetic hyper-arousal exhausts mental clarity and disrupts sleep. Clinical psychologist Dr. Elena Rostova explains somatic resets and cognitive boundaries that restore nervous system tone.",
            "content": """The autonomic nervous system is an involuntary balancing act between the sympathetic ('fight-or-flight') branch and the parasympathetic ('rest-and-digest') vagus nerve. 

### The Cost of Chronic Sympathetic Overdrive
When acute work or emotional stressors never resolve, baseline cortisol and adrenaline remain elevated. This alters prefrontal cortex function, making emotional regulation and deep decision-making significantly harder while amplifying irritability.

### Evidence-Based Somatic Tools:
- **The Physiological Sigh:** Inhale deeply through your nose, take a second top-off sniff to fully expand collapsed alveoli, then exhale slowly through your mouth. 3 repetitions triggers the baroreceptor reflex, immediately lowering heart rate.
- **Non-Sleep Deep Rest (NSDR):** A 15-minute body scan or yoga nidra session replenishes striatal dopamine reserves without requiring sleep.
- **Cognitive Boundary Audits:** Establish hard cutoffs between professional engagement and restorative home environments to allow systemic cortisol wash-out.

If persistent anxiety, panic episodes, or low mood are interfering with your daily wellbeing, schedule a private tele-therapy consultation with a licensed clinician.""",
            "likes_count": 87
        },
        # Sleep & Neurology by Dr. David Chen, MD
        {
            "author": doctor_instances['Chen'],
            "title": "Sleep Architecture: How Circadian Rhythms Govern Immunity & Brain Health",
            "category": "sleep",
            "read_time": "5 min read",
            "cover_image": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=900&q=80",
            "summary": "Deep non-REM and REM sleep are vital windows for glymphatic brain waste clearance and cellular immune regeneration. Learn the neurobiology of optimal sleep.",
            "content": """Sleep is not lost time; it is active neural maintenance. 

### The Glymphatic Cleanout
During Stage 3 Slow-Wave Sleep (Deep Sleep), glial channels in the brain widen by up to 60%. This allows cerebrospinal fluid to sweep away neuro-toxic metabolic debris accumulated during waking hours, including amyloid-beta and phosphorylated tau proteins.

### Anchoring Your Internal Clock:
1. **Morning Lux Exposure:** View natural outdoor sunlight within 30-60 minutes of waking. This triggers a timely cortisol peak and sets the 16-hour countdown timer for nocturnal melatonin release.
2. **Thermal Regulation:** The human core body temperature must drop by approximately 1°C (2-3°F) to initiate and maintain deep sleep. Keep your sleep environment cool (around 18°C or 65°F).
3. **Caffeine Half-Life:** Caffeine has an average half-life of 5-7 hours and a quarter-life of up to 12 hours. Cease consumption at least 9 hours before your target bedtime.

If you struggle with chronic insomnia or wake gasping for air, consult a sleep medicine specialist to screen for sleep apnea.""",
            "likes_count": 94
        }
    ]

    for item in articles:
        doc = item['author']
        art, created = HealthArticle.objects.update_or_create(
            title=item['title'],
            defaults={
                'author': doc,
                'creator_user': doc.user,
                'author_name_display': f"Dr. {doc.user.full_name}",
                'author_role_badge': f"{doc.specialization.name if doc.specialization else 'Physician'}",
                'author_type': 'doctor',
                'category': item['category'],
                'read_time': item['read_time'],
                'cover_image': item['cover_image'],
                'video_url': item.get('video_url', ''),
                'summary': item['summary'],
                'content': item['content'],
                'likes_count': item['likes_count'],
                'views_count': 180 + item['likes_count'] * 3,
                'is_verified_creator': True,
                'is_monetized': True,
                'is_published': True
            }
        )
        print(f"{'Created' if created else 'Updated'} article: {art.title} (Author: Dr. {doc.user.last_name})")

    print("\nDatabase successfully seeded with multidisciplinary specialists and evidence-backed articles!")

if __name__ == '__main__':
    run_seed()
