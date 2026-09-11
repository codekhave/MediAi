from rest_framework import serializers
from .models import HealthArticle, ArticleLike, CreatorProfile

class HealthArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    author_specialization = serializers.SerializerMethodField()
    author_hospital = serializers.SerializerMethodField()
    author_doctor_id = serializers.SerializerMethodField()
    author_bio = serializers.SerializerMethodField()
    author_rating = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    earnings = serializers.SerializerMethodField()

    class Meta:
        model = HealthArticle
        fields = [
            'id', 'author', 'creator_user', 'author_name', 'author_avatar', 
            'author_specialization', 'author_hospital', 'author_doctor_id', 'author_bio',
            'author_rating', 'author_role_badge', 'author_type',
            'title', 'category', 'summary', 'content', 'read_time', 
            'cover_image', 'video_url', 'video_file', 'views_count', 'likes_count',
            'is_verified_creator', 'is_monetized', 'earnings', 'is_liked',
            'is_published', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'likes_count', 'views_count', 'earnings', 'created_at', 'updated_at']

    def get_author_name(self, obj):
        if obj.author and obj.author.user:
            return obj.author.user.full_name
        if obj.creator_user:
            return obj.creator_user.full_name
        return obj.author_name_display or "MediAI Clinical Fellow"

    def get_author_avatar(self, obj):
        if obj.author and obj.author.user and obj.author.user.avatar:
            return obj.author.user.avatar
        if obj.creator_user and obj.creator_user.avatar:
            return obj.creator_user.avatar
        return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200"

    def get_author_specialization(self, obj):
        if obj.author and obj.author.specialization:
            return obj.author.specialization.name
        return obj.author_role_badge or "Healthcare Professional"

    def get_author_hospital(self, obj):
        if obj.author:
            return obj.author.hospital_affiliation
        return "MediAI Certified Healthcare Network"

    def get_author_doctor_id(self, obj):
        if obj.author:
            return obj.author.id
        return None

    def get_author_bio(self, obj):
        if obj.author and obj.author.bio:
            return obj.author.bio
        if obj.creator_user:
            creator_prof = CreatorProfile.objects.filter(user=obj.creator_user).first()
            if creator_prof and creator_prof.bio:
                return creator_prof.bio
        return "Board-certified clinical specialist dedicated to preventive lifestyle medicine and evidence-based patient empowerment."

    def get_author_rating(self, obj):
        if obj.author:
            return str(obj.author.rating)
        return "4.95"

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ArticleLike.objects.filter(user=request.user, article=obj).exists()
        return False

    def get_earnings(self, obj):
        # Strict privacy: ONLY visible to the creator themselves or an administrator
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if request.user.is_staff:
                return str(obj.earnings)
            if obj.creator_user and request.user == obj.creator_user:
                return str(obj.earnings)
            if obj.author and request.user == obj.author.user:
                return str(obj.earnings)
        return None



class HealthArticleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthArticle
        fields = [
            'id', 'title', 'category', 'summary', 'content', 
            'read_time', 'cover_image', 'video_url', 'video_file',
            'author_type', 'author_role_badge'
        ]


class CreatorProfileSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = CreatorProfile
        fields = [
            'id', 'user', 'user_name', 'user_email', 'user_role',
            'professional_title', 'bio', 'is_verified', 'is_monetization_approved',
            'verification_documents_uploaded', 'total_views', 'total_likes',
            'total_earned', 'pending_payout', 'payout_bank_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'total_views', 'total_likes', 'total_earned', 'pending_payout']
