from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.users.models import User, Specialization, DoctorProfile, PatientProfile
from apps.ai_engine.models import Symptom
from apps.community.models import HealthArticle, CreatorProfile

class Command(BaseCommand):
    help = 'Seeds initial specializations, symptoms, demo users, specialists, and rich community articles'

    def handle(self, *args, **options):
        self.stdout.write('Seeding comprehensive MediAI production data...')

        # 1. Specializations
        specs_data = [
            ('General Medicine', 'Primary care and internal health', 'Stethoscope'),
            ('Cardiology', 'Heart and blood vessel disorders', 'Heart'),
            ('Neurology', 'Brain, spinal cord, and nerve health', 'Brain'),
            ('Pediatrics', 'Child and infant healthcare', 'Baby'),
            ('Dermatology', 'Skin, hair, and nail conditions', 'Sparkles'),
            ('Orthopedics', 'Bones, joints, and muscular health', 'Activity'),
            ('Psychiatry', 'Mental health and emotional wellbeing', 'Smile'),
            ('Gynecology', 'Womens reproductive and pelvic health', 'ShieldAlert'),
            ('Clinical Psychology & Psychotherapy', 'Cognitive behavioral therapy, emotional resilience, and neuro-stress regulation', 'Brain'),
            ('Clinical Nutrition & Dietetics', 'Evidence-based metabolic nutrition, glycemic balance, and longevity diets', 'Apple'),
            ('Physical Therapy & Sports Medicine', 'Musculoskeletal rehabilitation, exercise physiology, and movement science', 'Activity'),
            ('Sleep & Circadian Medicine', 'Sleep architecture, circadian rhythm alignment, and hormonal health', 'Clock'),
            ('Preventive Longevity Medicine', 'Cellular repair, biomarker optimization, and preventative healthcare', 'ShieldCheck'),
        ]
        created_specs = {}
        for name, desc, icon in specs_data:
            spec_obj, _ = Specialization.objects.get_or_create(
                name=name,
                defaults={'description': desc, 'icon': icon}
            )
            created_specs[name] = spec_obj

        self.stdout.write(f'Configured {len(created_specs)} specializations.')

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

        self.stdout.write('Configured symptoms database.')

        # 3. Demo Admin User
        admin_user, _ = User.objects.get_or_create(
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

        # 4. Multi-Disciplinary Specialists & Doctors
        specialists = [
            {
                'email': 'doctor@mediai.com',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'spec_name': 'Cardiology',
                'licence': 'MD-CARDIO-8890',
                'hospital': 'Johns Hopkins Hospital',
                'bio': 'Board-certified cardiologist specializing in preventive cardiovascular medicine, arterial compliance, and non-invasive hemodynamics.',
                'avatar': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
                'title': 'Consultant Cardiologist & Clinical Fellow',
                'fee': Decimal('75.00')
            },
            {
                'email': 'david.chen@mediai.com',
                'first_name': 'David',
                'last_name': 'Chen',
                'spec_name': 'Neurology',
                'licence': 'MD-NEURO-77144',
                'hospital': 'Mount Sinai Health System',
                'bio': 'Attending Neurologist and researcher investigating sleep architecture, migraine neurovascular pathways, and glymphatic waste clearance.',
                'avatar': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
                'title': 'Attending Neurologist',
                'fee': Decimal('85.00')
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
                'title': 'Licensed Clinical Psychologist',
                'fee': Decimal('70.00')
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
                'title': 'Clinical Dietitian & Nutritionist',
                'fee': Decimal('60.00')
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
                'title': 'Doctor of Physical Therapy & Physiologist',
                'fee': Decimal('65.00')
            },
        ]

        doctor_profiles = {}
        for s in specialists:
            u, _ = User.objects.get_or_create(
                email=s['email'],
                defaults={
                    'first_name': s['first_name'],
                    'last_name': s['last_name'],
                    'role': 'doctor',
                    'avatar': s['avatar'],
                    'is_active': True,
                    'is_email_verified': True
                }
            )
            u.avatar = s['avatar']
            u.set_password('doctor123')
            u.save()

            dp, _ = DoctorProfile.objects.update_or_create(
                user=u,
                defaults={
                    'specialization': created_specs.get(s['spec_name']),
                    'licence_number': s['licence'],
                    'years_of_experience': 12,
                    'bio': s['bio'],
                    'hospital_affiliation': s['hospital'],
                    'consultation_fee': s['fee'],
                    'is_verified': True,
                    'is_approved': True,
                    'is_available_for_emergency': True,
                    'rating': 4.95,
                    'total_reviews': 38
                }
            )
            doctor_profiles[s['last_name']] = dp

            # Ensure CreatorProfile for Community publishing & creator studio
            CreatorProfile.objects.update_or_create(
                user=u,
                defaults={
                    'professional_title': s['title'],
                    'bio': s['bio'],
                    'is_verified': True,
                    'is_monetization_approved': True,
                    'verification_documents_uploaded': True,
                    'total_earned': Decimal('142.50'),
                    'pending_payout': Decimal('48.50'),
                    'payout_bank_details': 'Chase Premier Checking (Verified)'
                }
            )

        self.stdout.write(f'Configured {len(doctor_profiles)} Specialists and verified Creator Profiles.')

        # 5. Demo Patient User
        pat_user, _ = User.objects.get_or_create(
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
        PatientProfile.objects.get_or_create(
            user=pat_user,
            defaults={
                'blood_group': 'O+',
                'allergies': 'Penicillin',
                'chronic_conditions': 'Mild Asthma'
            }
        )
        self.stdout.write('Configured Patient user: patient@mediai.com / patient123')

        # 6. Comprehensive Community Health Articles & Guides
        primary_doc = doctor_profiles.get('Jenkins')
        cole_doc = doctor_profiles.get('Cole', primary_doc)
        lin_doc = doctor_profiles.get('Lin', primary_doc)
        chen_doc = doctor_profiles.get('Chen', primary_doc)
        rostova_doc = doctor_profiles.get('Rostova', primary_doc)

        articles_to_seed = [
            # 1. PHYSIOLOGY OF MOVEMENT
            {
                "doc": cole_doc,
                "title": "The Physiology of Movement: How Exercise Drives Lifelong Metabolic and Cellular Health",
                "category": "fitness",
                "read_time": "3 min read",
                "cover_image": "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=1000&q=80",
                "video_url": "https://www.youtube.com/embed/g_tea8ZNk5A",
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
                "author_role_badge": "Dr. Marcus Cole • Movement Physiologist",
                "author_type": "doctor",
                "earnings": Decimal("38.40"),
                "views_count": 890,
                "likes_count": 142
            },

            # 2. HARVARD HEALTHY EATING
            {
                "doc": lin_doc,
                "title": "The Harvard Healthy Eating Framework: Evidence-Based Nutrition for Budget, Middle Class, and Premium Lifestyles",
                "category": "nutrition",
                "read_time": "5 min read",
                "cover_image": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1000&q=80",
                "video_url": "https://www.youtube.com/embed/0aNNYEUARAk",
                "summary": "Rooted in Harvard T.H. Chan School of Public Health clinical research, this comprehensive nutrition guide demonstrates how anyone—regardless of income—can construct a disease-fighting plate.",
                "content": """Nutrition science is often obscured by expensive commercial trends. According to researchers at the Harvard T.H. Chan School of Public Health, optimal metabolic and cardiovascular defense is governed by whole-food nutrient density and macronutrient distribution, not luxury price tags.

### The Universal Harvard Healthy Eating Plate Blueprint
1. **Half Your Plate (50%) Vegetables and Fruits:** Aim for color and variety. Potatoes and French fries do not count as vegetables due to negative glycemic impact.
2. **One-Quarter (25%) Whole and Intact Grains:** Intact grains (brown rice, whole wheat, oats, quinoa) have a gentle effect on blood sugar compared to white flour.
3. **One-Quarter (25%) Healthy Protein:** Fish, poultry, beans, lentils, and nuts. Limit red meat and avoid processed meats entirely (bacon, cold cuts, hot dogs).
4. **Healthy Plant Oils (In Moderation):** Choose olive, canola, soy, corn, sunflower, and peanut oils; avoid partially hydrogenated trans-fats.
5. **Drink Water, Coffee, or Tea:** Skip sugary drinks, limit dairy to 1-2 servings/day, and juice to small glasses.

---

### Socioeconomic Nutritional Blueprints: Eating Healthy at Every Budget

#### Tier A: The Maximum-Nutrition Budget Protocol (Lowest Cost, High Acuity Defense)
You do not need high income to achieve elite nutritional markers. These pantry staples offer maximum biological value per dollar:
- **Proteins:** Eggs (nature's multivitamin, choline for liver/brain), dried beans, brown lentils, canned or local sardines/mackerel (rich in anti-inflammatory EPA/DHA omega-3s).
- **Complex Carbohydrates:** Raw rolled oats, sweet potatoes/yams (high beta-carotene and resistant starch), whole brown rice or sorghum.
- **Vegetables:** Dark leafy cabbage, frozen spinach, carrots, onions, local seasonal greens (pumpkin leaves, ugwu, waterleaf).
- **Fats:** Roasted groundnuts/peanuts, sunflower seeds, standard cold-pressed vegetable oils.
*Clinical Budget Tip: Buying dried legumes in bulk and soaking them overnight neutralizes phytates and cuts protein costs by 80% compared to beef.*

#### Tier B: The Middle-Class Mediterranean Optimization Protocol
With moderate discretionary food spending, focus on anti-inflammatory variety:
- **Proteins:** Lean skinless poultry, plain Greek yogurt (probiotic lactobacillus strains for gut microbiome integrity), canned wild tuna, firm tofu/edamame.
- **Carbohydrates:** Steel-cut oats, quinoa, whole grain farro, roasted chickpeas.
- **Vegetables & Fruits:** Frozen wild blueberries (highest polyphenol score), broccoli, cauliflower, Brussels sprouts (sulforaphane for cellular detoxification), bell peppers.
- **Fats:** Extra virgin olive oil (EVOO), whole avocados, raw almonds, chia and flax seeds.

#### Tier C: The Longevity Biomarker Optimization Protocol (Premium Tier)
For individuals optimizing for maximum epigenetic longevity and cellular biomarkers:
- **Proteins:** Wild-caught Alaskan sockeye salmon, organic pasture-raised eggs, 100% grass-fed organic beef, bone broth rich in type I/III collagen.
- **Carbohydrates:** Sprouted ancient grains (kamut, amaranth), organic purple sweet potatoes.
- **Vegetables & Fruits:** Organic brassica microgreens (concentrated sulforaphane), organic blackberries and raspberries, fresh artichokes.
- **Fats:** Cold-pressed single-estate unheated extra virgin olive oil, macadamia nuts, organic walnut halves, raw fermented sheep/goat kefir.

### The Universal Golden Takeaway
Whether spending $3 a day or $50 a day, your body cell membranes respond to identical biological rules: prioritize unprocessed whole foods, eliminate industrial seed trans-fats, crowd out refined sugars, and hydrate consistently with clean water.""",
                "author_role_badge": "Maya Lin • Clinical Dietitian",
                "author_type": "doctor",
                "earnings": Decimal("46.20"),
                "views_count": 1120,
                "likes_count": 215
            },

            # 3. CLINICAL VIDEO TUTORIAL: BLOOD PRESSURE
            {
                "doc": primary_doc,
                "title": "Clinical Video Demonstration: How to Accurately Measure Blood Pressure at Home",
                "category": "videos",
                "read_time": "3 min video",
                "cover_image": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&q=80",
                "video_url": "https://www.youtube.com/embed/n4d-3hZ4bLg",
                "summary": "Watch this step-by-step clinical video tutorial on the American Heart Association protocol for in-home automated blood pressure cuff readings, avoiding the 5 common measurement errors.",
                "content": """Hypertension is dubbed the 'silent killer' because it damages coronary arteries and cerebral vessels without noticeable symptoms. Performing accurate in-home blood pressure monitoring is vital.

### Key Video Demonstration Highlights:
1. **The 5-Minute Rest Rule:** Sit in a quiet room for 5 full minutes before pressing start. Do not talk, check your phone, or read stressful news.
2. **Body Positioning:** Keep feet flat on the floor (do not cross legs). Support your arm at heart level on a table.
3. **Cuff Placement:** Place cuff on bare skin 1 inch above the bend of your elbow. The arterial marker must align with your brachial artery.
4. **Take Two Readings:** Record 2 readings 1 minute apart morning and evening. Average the numbers.

### When to Escalate to Your Doctor
- **Normal:** < 120 / < 80 mmHg.
- **Elevated:** 120-129 / < 80 mmHg.
- **Stage 1 Hypertension:** 130-139 / 80-89 mmHg.
- **Stage 2 Hypertension:** >= 140 / >= 90 mmHg.
- **CRITICAL HYPERTENSIVE CRISIS:** > 180 and/or > 120 mmHg -> Trigger MediAI Emergency SOS or emergency department immediately.""",
                "author_role_badge": "Dr. Sarah Jenkins • Cardiologist",
                "author_type": "doctor",
                "earnings": Decimal("52.80"),
                "views_count": 1450,
                "likes_count": 310
            },

            # 4. 7 NON-NEGOTIABLE DAILY HEALTH RULES
            {
                "doc": primary_doc,
                "title": "7 Non-Negotiable Daily Health Rules Backed by Modern Medical Science",
                "category": "general",
                "read_time": "4 min read",
                "cover_image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&q=80",
                "video_url": "https://www.youtube.com/embed/8kX62n67d4E",
                "summary": "Basic, universally accessible habits that require no money, expensive equipment, or gym memberships—proven to extend healthspan and lower disease risk.",
                "content": """You do not need high wealth or elite medical access to implement the most potent preventive health habits known to medical science.

### 1. Hydration with Trace Electrolytes
Drink 500ml of water upon waking before caffeine. Add a tiny pinch of unrefined salt or lemon to optimize cellular osmolarity and kickstart renal filtration.

### 2. The 10-Minute Morning Light Exposure
Get outside within 45 minutes of sunrise. Sunlight entering your retinas sets your circadian cortisol-melatonin timer, improving night sleep and day focus.

### 3. Oral Hygiene and Heart Connection
Floss daily and brush for 2 minutes twice a day. Periodontal bacterial inflammation leaks into the bloodstream, directly accelerating arterial atherosclerosis.

### 4. Stand Up Every 45 Minutes
Prolonged unbroken sitting disables lipoprotein lipase (LPL) enzymes in your thighs. Standing for 2 minutes reactivates glucose and fat clearance.

### 5. Eat Your Vegetables First
Beginning lunch and dinner with fibrous greens before starches coats the intestinal lining, blunting postprandial glucose surges by up to 35%.

### 6. The 2-Breath Reset for Stress
When feeling overwhelmed, perform two deep nasal inhalations followed by a long, slow sigh out the mouth. It immediately stimulates the parasympathetic vagus nerve.

### 7. Never Sleep Next to a Charging Phone
Keep electronic screens away from your bed. Eliminate blue light 60 minutes before bed to allow your brain's natural melatonin surge.""",
                "author_role_badge": "Dr. Sarah Jenkins • Preventive Medicine",
                "author_type": "doctor",
                "earnings": Decimal("31.10"),
                "views_count": 670,
                "likes_count": 98
            },

            # 5. CARDIOVASCULAR MICRO-HABITS
            {
                "doc": primary_doc,
                "title": "10 Daily Micro-Habits for a Resilient Cardiovascular System",
                "category": "heart",
                "read_time": "4 min read",
                "cover_image": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
                "video_url": None,
                "summary": "Cardiovascular disease remains the world's leading killer, yet 80% of events are preventable. Learn simple daily rituals that protect your arterial lining and optimize blood pressure.",
                "content": """Cardiovascular health is not built in the emergency room; it is cultivated through consistent, daily micro-decisions. 

### 1. The 10-Minute Postprandial Walk
Taking a brisk 10-minute walk after meals blunts postprandial glucose spikes by up to 30%, preventing vascular endothelial inflammation.

### 2. Prioritize Dietary Potassium Over Sodium Restriction Alone
While reducing processed sodium is vital, increasing dietary potassium (avocados, leafy greens, coconut water) naturally promotes vasodilation and balances cellular fluids.

### 3. Track Your Resting Heart Rate (RHR)
A consistently elevating resting heart rate often signals chronic sympathetic overactivation, systemic dehydration, or early infection.

### 4. Optimize Omega-3 Index
Incorporate wild cold-water fish or high-potency EPA/DHA supplements to stabilize cardiac membrane potentials and reduce resting triglycerides.

### Clinical Guidance
If you experience unexplained palpitations, exertional chest tightness, or severe shortness of breath, do not delay—book an immediate clinical tele-consultation.""",
                "author_role_badge": "Dr. Sarah Jenkins • Cardiologist",
                "author_type": "doctor",
                "earnings": Decimal("42.00"),
                "views_count": 780,
                "likes_count": 148
            },

            # 6. CIRCADIAN SLEEP ARCHITECTURE
            {
                "doc": chen_doc,
                "title": "The Circadian Protocol: How Sleep Architecture Controls Immunity & Weight",
                "category": "sleep",
                "read_time": "5 min read",
                "cover_image": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80",
                "video_url": None,
                "summary": "Deep sleep is your body's primary repair window. Learn how circadian alignment regulates leptin, ghrelin, natural killer cells, and mental clarity.",
                "content": """Sleep is not passive downtime—it is an active neurological and metabolic sanitation cycle. 

### The Glymphatic Cleanout
During Stage 3 Slow-Wave Sleep (Deep Sleep), glial cells in the brain shrink by 60%, allowing cerebrospinal fluid to flush out metabolic waste, including amyloid-beta proteins.

### The Cortisol-Melatonin Seesaw
- **Morning Sunlight:** Exposing your eyes to unfiltered natural morning sunlight within 30 minutes of waking anchors your suprachiasmatic nucleus (SCN).
- **Evening Darkness:** Blue light after sunset blocks melatonin synthesis, delaying deep sleep latency.

### Actionable Evening Checklist
1. Maintain consistent bed and wake times (even on weekends).
2. Keep the bedroom temperature around 18-19°C (65-67°F).
3. Cease caffeine intake at least 9 hours prior to sleep.""",
                "author_role_badge": "Dr. David Chen • Neurologist",
                "author_type": "doctor",
                "earnings": Decimal("49.50"),
                "views_count": 920,
                "likes_count": 162
            },

            # 7. DEMYSTIFYING BLOOD SUGAR
            {
                "doc": lin_doc,
                "title": "Demystifying Blood Sugar: Why Glucose Spikes Cause Afternoon Brain Fog",
                "category": "nutrition",
                "read_time": "3 min read",
                "cover_image": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
                "video_url": None,
                "summary": "Ever feel exhausted around 2:00 PM? The culprit is usually reactive hypoglycemia triggered by refined carbohydrates. Here is how to eat for sustained mental endurance.",
                "content": """Many professionals mistake afternoon exhaustion for lack of willpower or insufficient caffeine. In reality, it is a predictable biochemical response.

### The Anatomy of the Glucose Rollercoaster
When you consume refined starches or naked sugars without protein and fiber:
1. Blood glucose surges rapidly.
2. The pancreas releases a flood of insulin to clear the excess sugar.
3. Glucose crashes below baseline (reactive hypoglycemia), triggering brain fog, anxiety, and sugar cravings.

### The 'Clothing Your Carbs' Rule
Never eat carbohydrates naked. Always pair them with healthy fats, dietary fiber, or lean protein to slow gastric emptying and flatten the glucose curve.""",
                "author_role_badge": "Maya Lin • Clinical Dietitian",
                "author_type": "doctor",
                "earnings": Decimal("28.00"),
                "views_count": 640,
                "likes_count": 135
            },

            # 8. HORMONAL BALANCE & WOMEN'S HEALTH
            {
                "doc": primary_doc,
                "title": "Hormonal Balance & Cycle Tracking: Listening to Your Body's Internal Rhythm",
                "category": "women_health",
                "read_time": "5 min read",
                "cover_image": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80",
                "video_url": None,
                "summary": "Understanding your infradian rhythm allows you to align nutrition, workouts, and stress management with your body's natural hormonal phases.",
                "content": """Just as we have a 24-hour circadian clock, women have an infradian cycle spanning approximately 28 to 32 days. 

### The Four Hormonal Seasons:
- **Follicular Phase (Spring):** Estrogen rises, increasing neuroplasticity, creativity, and physical stamina.
- **Ovulatory Phase (Summer):** Peak estrogen and testosterone. Energy, confidence, and metabolic rate are at their highest.
- **Luteal Phase (Autumn):** Progesterone rises. The body prioritizes calm, nutrient-dense foods, and restorative strength training.
- **Menstrual Phase (Winter):** Hormones reset. Prioritize iron-rich nutrition, warmth, hydration, and mental reflection.

### When to Seek Medical Attention
Severe cramps (dysmenorrhea) that disrupt daily life, irregular cycles, or severe premenstrual mood changes warrant a dedicated tele-consultation with a verified gynecologist.""",
                "author_role_badge": "Dr. Sarah Jenkins • Clinical Fellow",
                "author_type": "doctor",
                "earnings": Decimal("55.00"),
                "views_count": 1050,
                "likes_count": 189
            },

            # 9. HEADACHE VS MIGRAINE
            {
                "doc": chen_doc,
                "title": "Headache vs. Migraine: Critical Warning Signs You Should Never Overlook",
                "category": "preventive",
                "read_time": "4 min read",
                "cover_image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
                "video_url": None,
                "summary": "Is it tension, sinus pressure, or a neurological migraine? Learn the clinical diagnostic criteria and the red-flag symptoms requiring emergency evaluation.",
                "content": """Headaches are one of the most common complaints presented in telemedicine, yet differentiating benign tension from neurovascular pathology is critical.

### Tension-Type Headaches
- Sensation: A dull, tightening 'band' squeezing across the forehead or back of the neck.
- Triggers: Poor posture, cervical strain, dehydration, prolonged monitor glare.

### Migraines with Aura
- Sensation: Throbbing, pulsating, unilateral (one-sided) pain often accompanied by photophobia (light sensitivity), nausea, and visual zig-zag lines.

### RED FLAG 'SNOOP' CRITERIA (Seek Immediate ER Care):
- **S**ystemic symptoms (fever, unexplained weight loss).
- **N**eurologic signs (confusion, numbness, facial weakness).
- **O**nset sudden ('thunderclap' headache reaching peak intensity in seconds).
- **O**lder age of onset (>50 years with new headache pattern).
- **P**rogression or change in clinical headache characteristics.""",
                "author_role_badge": "Dr. David Chen • Neurologist",
                "author_type": "doctor",
                "earnings": Decimal("36.00"),
                "views_count": 710,
                "likes_count": 174
            },

            # 10. NEUROBIOLOGY OF STRESS & CORTISOL
            {
                "doc": rostova_doc,
                "title": "The Science of Stress & Cortisol: Protecting Your Adrenal & Nervous System",
                "category": "mental_health",
                "read_time": "4 min read",
                "cover_image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
                "video_url": None,
                "summary": "Chronic micro-stress keeps your sympathetic nervous system permanently on edge. Discover somatic and physiological resets that restore vagal nerve tone.",
                "content": """Stress was designed by evolution as an acute, life-saving mechanism. In the 21st century, however, psychological stress has become continuous and systemic.

### What Prolonged High Cortisol Does
- Breaks down muscle tissue and promotes visceral abdominal adiposity.
- Suppresses secretory IgA, weakening mucosal immunity in the gut and airways.
- Disrupts restorative REM and deep sleep cycles.

### The Physiological Sigh: The Fastest Calming Tool
Discovered by neurobiologists, the **Physiological Sigh** is a two-breath inhalation through the nose (one deep, followed immediately by a sharp top-off sniff), followed by a slow, extended exhalation through the mouth. Performing this 3 to 5 times rapidly drops heart rate by engaging the parasympathetic vagus nerve.""",
                "author_role_badge": "Dr. Elena Rostova • Clinical Psychologist",
                "author_type": "doctor",
                "earnings": Decimal("44.00"),
                "views_count": 830,
                "likes_count": 156
            }
        ]

        count = 0
        for item in articles_to_seed:
            doc = item['doc']
            HealthArticle.objects.update_or_create(
                title=item['title'],
                defaults={
                    'author': doc,
                    'creator_user': doc.user if doc else None,
                    'author_name_display': f"Dr. {doc.user.full_name}" if doc else "MediAI Medical Board",
                    'author_role_badge': item.get('author_role_badge', 'Verified Medical Specialist'),
                    'author_type': item.get('author_type', 'doctor'),
                    'category': item['category'],
                    'read_time': item['read_time'],
                    'cover_image': item['cover_image'],
                    'video_url': item.get('video_url') or '',
                    'summary': item['summary'],
                    'content': item['content'],
                    'likes_count': item['likes_count'],
                    'views_count': item['views_count'],
                    'earnings': item['earnings'],
                    'is_verified_creator': True,
                    'is_monetized': True,
                    'is_published': True
                }
            )
            count += 1

        self.stdout.write(f'Successfully seeded {count} published Health & Wellness Articles.')
        self.stdout.write(self.style.SUCCESS('MediAI production database fully seeded with specialists & community articles!'))
