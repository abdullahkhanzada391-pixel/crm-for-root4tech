from django.contrib import admin
from django.urls import path, include
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def api_health_check(request):
    return Response({
        'status': 'healthy',
        'app': 'ROOT 4 TECH CRM Backend API',
        'phase': 'Phase 1 - Foundation & UI Architecture',
        'version': '1.0.0',
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', api_health_check, name='api-health'),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]
