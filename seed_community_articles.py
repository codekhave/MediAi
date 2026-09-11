import os
import sys
import django

# Setup django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediai_backend.settings')
django.setup()

from apps.users.models import DoctorProfile
from apps.community.models import HealthArticle

def seed_articles():
    doctor = DoctorProfile.objects.filter(is_approved=True).first()
    if not doctor:
        print("No approved doctor found to author articles!")
        return

    articles_data = [
        {
            "title": "10 Daily Micro-Habits for a Resilient Cardiovascular System",
            "category": "heart",
            "read_time": "4 min read",
            "cover_image": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
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
            "likes_count": 48
        },
        {
            "title": "The Circadian Protocol: How Sleep Architecture Controls Immunity & Weight",
            "category": "sleep",
            "read_time": "5 min read",
            "cover_image": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80",
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
            "likes_count": 62
        },
        {
            "title": "Demystifying Blood Sugar: Why Glucose Spikes Cause Afternoon Brain Fog",
            "category": "nutrition",
            "read_time": "3 min read",
            "cover_image": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
            "summary": "Ever feel exhausted around 2:00 PM? The culprit is usually reactive hypoglycemia triggered by refined carbohydrates. Here is how to eat for sustained mental endurance.",
            "content": """Many professionals mistake afternoon exhaustion for lack of willpower or insufficient caffeine. In reality, it is a predictable biochemical response.

### The Anatomy of the Glucose Rollercoaster
When you consume refined starches or naked sugars without protein and fiber:
1. Blood glucose surges rapidly.
2. The pancreas releases a flood of insulin to clear the excess sugar.
3. Glucose crashes below baseline (reactive hypoglycemia), triggering brain fog, anxiety, and sugar cravings.

### The 'Clothing Your Carbs' Rule
Never eat carbohydrates naked. Always pair them with healthy fats, dietary fiber, or lean protein to slow gastric emptying and flatten the glucose curve.""",
            "likes_count": 35
        },
        {
            "title": "Hormonal Balance & Cycle Tracking: Listening to Your Body's Internal Rhythm",
            "category": "women_health",
            "read_time": "5 min read",
            "cover_image": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80",
            "summary": "Understanding your infradian rhythm allows you to align nutrition, workouts, and stress management with your body's natural hormonal phases.",
            "content": """Just as we have a 24-hour circadian clock, women have an infradian cycle spanning approximately 28 to 32 days. 

### The Four Hormonal Seasons:
- **Follicular Phase (Spring):** Estrogen rises, increasing neuroplasticity, creativity, and physical stamina.
- **Ovulatory Phase (Summer):** Peak estrogen and testosterone. Energy, confidence, and metabolic rate are at their highest.
- **Luteal Phase (Autumn):** Progesterone rises. The body prioritizes calm, nutrient-dense foods, and restorative strength training.
- **Menstrual Phase (Winter):** Hormones reset. Prioritize iron-rich nutrition, warmth, hydration, and mental reflection.

### When to Seek Medical Attention
Severe cramps (dysmenorrhea) that disrupt daily life, irregular cycles, or severe premenstrual mood changes warrant a dedicated tele-consultation with a verified gynecologist.""",
            "likes_count": 89
        },
        {
            "title": "Headache vs. Migraine: Critical Warning Signs You Should Never Overlook",
            "category": "preventive",
            "read_time": "4 min read",
            "cover_image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
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
            "likes_count": 74
        },
        {
            "title": "The Science of Stress & Cortisol: Protecting Your Adrenal & Nervous System",
            "category": "mental_health",
            "read_time": "4 min read",
            "cover_image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
            "summary": "Chronic micro-stress keeps your sympathetic nervous system permanently on edge. Discover somatic and physiological resets that restore vagal nerve tone.",
            "content": """Stress was designed by evolution as an acute, life-saving mechanism. In the 21st century, however, psychological stress has become continuous and systemic.

### What Prolonged High Cortisol Does
- Breaks down muscle tissue and promotes visceral abdominal adiposity.
- Suppresses secretory IgA, weakening mucosal immunity in the gut and airways.
- Disrupts restorative REM and deep sleep cycles.

### The Physiological Sigh: The Fastest Calming Tool
Discovered by neurobiologists, the **Physiological Sigh** is a two-breath inhalation through the nose (one deep, followed immediately by a sharp top-off sniff), followed by a slow, extended exhalation through the mouth. Performing this 3 to 5 times rapidly drops heart rate by engaging the parasympathetic vagus nerve.""",
            "likes_count": 56
        }
    ]

    for item in articles_data:
        article, created = HealthArticle.objects.update_or_create(
            title=item['title'],
            defaults={
                'author': doctor,
                'category': item['category'],
                'read_time': item['read_time'],
                'cover_image': item['cover_image'],
                'summary': item['summary'],
                'content': item['content'],
                'likes_count': item['likes_count'],
                'is_published': True
            }
        )
        print(f"{'Created' if created else 'Updated'} article: {article.title}")

    print(f"Successfully seeded {len(articles_data)} health & wellness articles!")

if __name__ == '__main__':
    seed_articles()
