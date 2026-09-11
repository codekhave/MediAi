import uuid
from django.db import models
from django.conf import settings
from apps.users.models import DoctorProfile

class HealthArticle(models.Model):
    CATEGORY_CHOICES = (
        ('general', 'General Health Tips'),
        ('nutrition', 'Nutrition & Harvard Healthy Eating'),
        ('heart', 'Heart Health & Cardio'),
        ('sleep', 'Sleep & Circadian Health'),
        ('fitness', 'Fitness, Movement & Exercise'),
        ('women_health', "Women's Health & Hormones"),
        ('mental_health', 'Mental Wellness & Stress'),
        ('pediatrics', 'Child & Infant Care'),
        ('preventive', 'Preventive Longevity & Vitals'),
        ('videos', 'Video Care Tutorials & Demonstrations'),
    )

    AUTHOR_TYPE_CHOICES = (
        ('doctor', 'Board-Certified Doctor'),
        ('nurse', 'Registered Nurse'),
        ('trainer', 'Certified Fitness/Physio Specialist'),
        ('nutritionist', 'Clinical Dietitian'),
        ('contributor', 'Health Contributor'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(DoctorProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles')
    creator_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='created_articles')
    
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    summary = models.TextField(help_text="Short engaging summary for the feed card")
    content = models.TextField(help_text="Detailed article content, clinical insights and protocols")
    read_time = models.CharField(max_length=20, default='3 min read')
    cover_image = models.URLField(max_length=500, blank=True)
    video_url = models.URLField(max_length=500, blank=True, null=True, help_text="Optional YouTube or Cloudinary video tutorial URL")
    video_file = models.FileField(upload_to='community_videos/', null=True, blank=True, help_text="Direct uploaded video file (MP4, WebM)")
    
    author_name_display = models.CharField(max_length=150, blank=True)
    author_role_badge = models.CharField(max_length=100, default='Verified Medical Specialist')
    author_type = models.CharField(max_length=30, choices=AUTHOR_TYPE_CHOICES, default='doctor')
    
    is_verified_creator = models.BooleanField(default=True)
    is_monetized = models.BooleanField(default=True)
    earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    views_count = models.PositiveIntegerField(default=150)
    likes_count = models.PositiveIntegerField(default=0)
    
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'health_articles'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"


class ArticleLike(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='article_likes')
    article = models.ForeignKey(HealthArticle, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'article_likes'
        unique_together = ('user', 'article')

    def __str__(self):
        return f"{self.user.email} likes {self.article.title}"


class CreatorProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='creator_profile')
    professional_title = models.CharField(max_length=150, blank=True, help_text="e.g. Cardiologist, Registered Clinical Nurse, Certified Strength Coach")
    bio = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    is_monetization_approved = models.BooleanField(default=False)
    verification_documents_uploaded = models.BooleanField(default=False)
    
    total_views = models.PositiveIntegerField(default=0)
    total_likes = models.PositiveIntegerField(default=0)
    total_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    pending_payout = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payout_bank_details = models.CharField(max_length=255, blank=True, help_text="Bank Name, Account Number, Routing/Swift")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'creator_profiles'

    def __str__(self):
        return f"Creator {self.user.full_name} ({'Monetized' if self.is_monetization_approved else 'Standard'})"
