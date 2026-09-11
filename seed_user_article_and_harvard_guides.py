import os
import sys
import django
from decimal import Decimal

# Setup django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediai_backend.settings')
django.setup()

from apps.users.models import DoctorProfile, User
from apps.community.models import HealthArticle, CreatorProfile

def seed():
    doctor = DoctorProfile.objects.filter(is_approved=True).first()
    if not doctor:
        print("Doctor profile not found!")
        return

    # Ensure creator profile for doctor
    doc_creator, _ = CreatorProfile.objects.get_or_create(user=doctor.user)
    doc_creator.is_verified = True
    doc_creator.is_monetization_approved = True
    doc_creator.verification_documents_uploaded = True
    doc_creator.professional_title = "Consultant Cardiologist & Clinical Fellow"
    doc_creator.total_earned = Decimal("142.50")
    doc_creator.pending_payout = Decimal("48.50")
    doc_creator.save()

    articles_to_seed = [
        # 1. USER'S EXACT ARTICLE
        {
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

* **Zone 2 Aerobic Base:** 150 minutes per week of low-to-moderate steady-state cardio (such as brisk incline walking, rowing, or cycling) where conversational breathing is maintained.
* **Resistance Stimulus:** 2 to 3 weekly sessions focusing on primary compound movements (hinges, squats, presses, and rows) to stimulate musculoskeletal remodeling.
* **Non-Exercise Activity (NEAT):** Target 7,000 to 10,000 steps daily to prevent prolonged sedentary periods and enhance peripheral insulin sensitivity.
* **Cellular Recovery:** 7 to 9 hours of restorative sleep per night alongside adequate dietary protein to support tissue synthesis and neural regeneration.

Integrating regular physical exertion with whole-food nutrition and deliberate recovery creates an enduring physiological reserve, turning daily movement into the cornerstone of preventive healthcare.""",
            "author_role_badge": "Dr. Sarah Jenkins • Cardiologist",
            "author_type": "doctor",
            "is_verified_creator": True,
            "is_monetized": True,
            "earnings": Decimal("38.40"),
            "views_count": 890,
            "likes_count": 142
        },

        # 2. HARVARD HEALTHY EATING: BUDGET, MIDDLE CLASS & WEALTHY PROTOCOLS
        {
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
            "author_role_badge": "Dr. Sarah Jenkins • Harvard Clinical Resource Fellow",
            "author_type": "doctor",
            "is_verified_creator": True,
            "is_monetized": True,
            "earnings": Decimal("46.20"),
            "views_count": 1120,
            "likes_count": 215
        },

        # 3. CLINICAL VIDEO TUTORIAL: BLOOD PRESSURE & VITAL SIGNS
        {
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
            "is_verified_creator": True,
            "is_monetized": True,
            "earnings": Decimal("52.80"),
            "views_count": 1450,
            "likes_count": 310
        },

        # 4. GENERAL BASIC HEALTH TIPS FOR EVERYDAY CITIZENS
        {
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
            "is_verified_creator": True,
            "is_monetized": True,
            "earnings": Decimal("31.10"),
            "views_count": 670,
            "likes_count": 98
        }
    ]

    for item in articles_to_seed:
        art, created = HealthArticle.objects.update_or_create(
            title=item['title'],
            defaults={
                'author': doctor,
                'creator_user': doctor.user,
                'category': item['category'],
                'read_time': item['read_time'],
                'cover_image': item['cover_image'],
                'video_url': item.get('video_url'),
                'summary': item['summary'],
                'content': item['content'],
                'author_role_badge': item.get('author_role_badge', 'Verified Doctor'),
                'author_type': item.get('author_type', 'doctor'),
                'is_verified_creator': item.get('is_verified_creator', True),
                'is_monetized': item.get('is_monetized', True),
                'earnings': item.get('earnings', Decimal('0.00')),
                'views_count': item.get('views_count', 100),
                'likes_count': item.get('likes_count', 10),
                'is_published': True
            }
        )
        print(f"{'Created' if created else 'Updated'}: {art.title} (Views: {art.views_count}, Earnings: ${art.earnings})")

    print(f"Total articles in platform now: {HealthArticle.objects.count()}")

if __name__ == '__main__':
    seed()
