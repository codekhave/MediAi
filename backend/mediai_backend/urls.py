from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/ai/', include('apps.ai_engine.urls')),
    path('api/appointments/', include('apps.appointments.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/emergency/', include('apps.emergency.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/community/', include('apps.community.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
