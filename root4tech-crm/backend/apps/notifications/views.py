from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Notification

class NotificationListAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        notifications = Notification.objects.all()[:15]
        data = [
            {
                'id': n.id,
                'title': n.title,
                'message': n.message,
                'category': n.category,
                'is_read': n.is_read,
                'created_at': n.created_at.isoformat(),
            }
            for n in notifications
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        Notification.objects.all().update(is_read=True)
        return Response({'message': 'All notifications marked as read.'}, status=status.HTTP_200_OK)
