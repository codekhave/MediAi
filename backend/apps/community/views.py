from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from decimal import Decimal
from .models import HealthArticle, ArticleLike, CreatorProfile
from .serializers import HealthArticleSerializer, HealthArticleCreateSerializer, CreatorProfileSerializer
from apps.users.models import DoctorProfile
from apps.users.permissions import IsDoctor, IsAdmin

class HealthArticleListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request):
        queryset = HealthArticle.objects.filter(is_published=True).select_related('author__user', 'author__specialization', 'creator_user')
        
        category = request.query_params.get('category')
        if category and category != 'all':
            if category == 'videos':
                queryset = queryset.filter(video_url__isnull=False).exclude(video_url='')
            else:
                queryset = queryset.filter(category=category)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(summary__icontains=search) | 
                Q(content__icontains=search) |
                Q(author_name_display__icontains=search) |
                Q(author__user__first_name__icontains=search) |
                Q(author__user__last_name__icontains=search)
            )

        serializer = HealthArticleSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        doctor_profile = DoctorProfile.objects.filter(user=user).first()
        creator_profile, _ = CreatorProfile.objects.get_or_create(user=user)

        # STRICT GATE: Only verified users (approved doctors or verified health creators) can publish
        is_verified = False
        is_monetized = False
        author_role_badge = request.data.get('author_role_badge', 'Certified Health Specialist')
        author_type = request.data.get('author_type', 'contributor')

        if doctor_profile and doctor_profile.is_approved:
            is_verified = True
            is_monetized = True
            author_role_badge = f"Dr. {doctor_profile.user.last_name} • {doctor_profile.specialization.name if doctor_profile.specialization else 'Physician'}"
            author_type = 'doctor'
            creator_profile.is_verified = True
            creator_profile.is_monetization_approved = True
            creator_profile.save()
        elif creator_profile.is_verified or creator_profile.is_monetization_approved:
            is_verified = True
            is_monetized = creator_profile.is_monetization_approved
            author_role_badge = creator_profile.professional_title or "Verified Health Specialist"
        else:
            return Response({
                'error': 'Publishing is restricted exclusively to verified medical doctors, psychologists, therapists, and certified wellness specialists. Please upload your verification documents in the Creator Studio to apply.'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = HealthArticleCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        article = serializer.save(
            author=doctor_profile if (doctor_profile and doctor_profile.is_approved) else None,
            creator_user=user,
            author_name_display=user.full_name,
            author_role_badge=author_role_badge,
            author_type=author_type,
            is_verified_creator=is_verified,
            is_monetized=is_monetized,
            is_published=True
        )

        return Response(HealthArticleSerializer(article, context={'request': request}).data, status=status.HTTP_201_CREATED)



class HealthArticleDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            article = HealthArticle.objects.get(pk=pk, is_published=True)
        except HealthArticle.DoesNotExist:
            return Response({'error': 'Article not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Increment views & calculate engagement reward if creator is monetized
        article.views_count += 1
        if article.is_monetized:
            # $0.02 micro-royalty per read view
            earning_delta = Decimal('0.02')
            article.earnings += earning_delta
            
            # Credit creator profile
            creator_user = article.author.user if article.author else article.creator_user
            if creator_user:
                prof, _ = CreatorProfile.objects.get_or_create(user=creator_user)
                prof.total_views += 1
                prof.total_earned += earning_delta
                prof.pending_payout += earning_delta
                prof.save()

        article.save(update_fields=['views_count', 'earnings'])
        return Response(HealthArticleSerializer(article, context={'request': request}).data)


class HealthArticleLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            article = HealthArticle.objects.get(pk=pk)
        except HealthArticle.DoesNotExist:
            return Response({'error': 'Article not found.'}, status=status.HTTP_404_NOT_FOUND)

        like = ArticleLike.objects.filter(user=request.user, article=article).first()
        if like:
            like.delete()
            if article.likes_count > 0:
                article.likes_count -= 1
                article.save(update_fields=['likes_count'])
            is_liked = False
        else:
            ArticleLike.objects.create(user=request.user, article=article)
            article.likes_count += 1
            if article.is_monetized:
                # Engagement bonus for helpful like
                like_bonus = Decimal('0.05')
                article.earnings += like_bonus
                creator_user = article.author.user if article.author else article.creator_user
                if creator_user:
                    prof, _ = CreatorProfile.objects.get_or_create(user=creator_user)
                    prof.total_likes += 1
                    prof.total_earned += like_bonus
                    prof.pending_payout += like_bonus
                    prof.save()
            article.save(update_fields=['likes_count', 'earnings'])
            is_liked = True

        return Response({
            'is_liked': is_liked,
            'likes_count': article.likes_count,
            'earnings': str(article.earnings),
            'message': 'Article liked' if is_liked else 'Article unliked'
        })


class CreatorDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = CreatorProfile.objects.get_or_create(user=request.user)
        # Check if user is an approved doctor
        doc_prof = DoctorProfile.objects.filter(user=request.user, is_approved=True).first()
        if doc_prof:
            profile.is_verified = True
            profile.is_monetization_approved = True
            profile.verification_documents_uploaded = True
            if not profile.professional_title:
                profile.professional_title = f"Board-Certified {doc_prof.specialization.name if doc_prof.specialization else 'Physician'}"
            profile.save()

        user_articles = HealthArticle.objects.filter(
            Q(creator_user=request.user) | Q(author__user=request.user)
        )
        articles_data = HealthArticleSerializer(user_articles, many=True, context={'request': request}).data

        return Response({
            'creator_profile': CreatorProfileSerializer(profile).data,
            'my_articles': articles_data,
            'metrics': {
                'total_articles': user_articles.count(),
                'total_views': profile.total_views,
                'total_likes': profile.total_likes,
                'total_earned': str(profile.total_earned),
                'pending_payout': str(profile.pending_payout),
                'is_eligible': profile.is_monetization_approved
            }
        })

    def post(self, request):
        profile, _ = CreatorProfile.objects.get_or_create(user=request.user)
        action = request.data.get('action')

        if action == 'upload_documents':
            profile.verification_documents_uploaded = True
            profile.professional_title = request.data.get('professional_title', profile.professional_title)
            profile.bio = request.data.get('bio', profile.bio)
            profile.payout_bank_details = request.data.get('payout_bank_details', profile.payout_bank_details)
            profile.save()
            return Response({'message': 'Documents submitted for monetization verification!', 'profile': CreatorProfileSerializer(profile).data})

        elif action == 'request_payout':
            if profile.pending_payout <= Decimal('5.00'):
                return Response({'error': 'Minimum withdrawal threshold is $5.00.'}, status=status.HTTP_400_BAD_REQUEST)
            amount = profile.pending_payout
            profile.pending_payout = Decimal('0.00')
            profile.save()
            return Response({'message': f'Payout request for ${amount} submitted successfully to your account!', 'profile': CreatorProfileSerializer(profile).data})

        return Response({'error': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)


class AdminCreatorModerationView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        creators = CreatorProfile.objects.all().select_related('user')
        return Response(CreatorProfileSerializer(creators, many=True).data)

    def patch(self, request, pk):
        try:
            creator = CreatorProfile.objects.get(pk=pk)
        except CreatorProfile.DoesNotExist:
            return Response({'error': 'Creator not found.'}, status=status.HTTP_404_NOT_FOUND)

        is_monetization_approved = request.data.get('is_monetization_approved')
        if is_monetization_approved is not None:
            creator.is_monetization_approved = is_monetization_approved
            creator.is_verified = is_monetization_approved
            creator.save()

            # Also update all articles by this creator
            HealthArticle.objects.filter(creator_user=creator.user).update(
                is_verified_creator=is_monetization_approved,
                is_monetized=is_monetization_approved
            )

        return Response(CreatorProfileSerializer(creator).data)


class AuthorProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, author_id):
        # author_id can be a doctor_id, creator_profile_id, or user_id
        doctor = DoctorProfile.objects.filter(id=author_id).select_related('user', 'specialization').first()
        if not doctor:
            doctor = DoctorProfile.objects.filter(user__id=author_id).select_related('user', 'specialization').first()

        if doctor:
            user = doctor.user
            creator_profile = CreatorProfile.objects.filter(user=user).first()
            specialty_name = doctor.specialization.name if doctor.specialization else "Medical Specialist"
            name = f"Dr. {user.full_name}"
            title = f"Board-Certified {specialty_name}"
            hospital = doctor.hospital_affiliation or "MediAI Clinical Medical Network"
            bio = doctor.bio or (creator_profile.bio if creator_profile else "Specialist in clinical care and preventive medicine.")
            avatar = user.avatar
            rating = str(doctor.rating)
            doctor_id = str(doctor.id)
            articles = HealthArticle.objects.filter(author=doctor, is_published=True)
        else:
            creator_profile = CreatorProfile.objects.filter(id=author_id).select_related('user').first()
            if not creator_profile:
                creator_profile = CreatorProfile.objects.filter(user__id=author_id).select_related('user').first()
            if not creator_profile:
                return Response({'error': 'Author not found.'}, status=status.HTTP_404_NOT_FOUND)

            user = creator_profile.user
            doc_prof = DoctorProfile.objects.filter(user=user).first()
            doctor_id = str(doc_prof.id) if doc_prof else None
            name = user.full_name
            title = creator_profile.professional_title or "Verified Health Specialist"
            hospital = "MediAI Health & Wellness Network"
            bio = creator_profile.bio or "Dedicated to evidence-based healthy living, exercise physiology, and mental health."
            avatar = user.avatar
            rating = "4.95"
            articles = HealthArticle.objects.filter(Q(creator_user=user) | Q(author__user=user), is_published=True)

        articles_data = HealthArticleSerializer(articles, many=True, context={'request': request}).data

        return Response({
            'author_id': str(author_id),
            'doctor_id': doctor_id,
            'name': name,
            'title': title,
            'hospital': hospital,
            'bio': bio,
            'avatar': avatar or "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200",
            'rating': rating,
            'is_verified': True,
            'total_articles': articles.count(),
            'articles': articles_data
        })

