from django.urls import path
from .views import (
    HealthArticleListCreateView, HealthArticleDetailView, 
    HealthArticleLikeView, CreatorDashboardView, AdminCreatorModerationView,
    AuthorProfileView
)

urlpatterns = [
    path('articles/', HealthArticleListCreateView.as_view(), name='article_list_create'),
    path('articles/<uuid:pk>/', HealthArticleDetailView.as_view(), name='article_detail'),
    path('articles/<uuid:pk>/like/', HealthArticleLikeView.as_view(), name='article_like'),
    path('authors/<str:author_id>/', AuthorProfileView.as_view(), name='author_profile'),
    path('creator/dashboard/', CreatorDashboardView.as_view(), name='creator_dashboard'),
    path('admin/creators/', AdminCreatorModerationView.as_view(), name='admin_creator_list'),
    path('admin/creators/<uuid:pk>/', AdminCreatorModerationView.as_view(), name='admin_creator_detail'),
]

