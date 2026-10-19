from django.urls import path
from .views import (
    DashboardStatsAPIView,
    DashboardChartsAPIView,
    RecentLeadsAPIView,
    ActivityStreamAPIView,
    UpcomingTasksAPIView,
    TaskToggleAPIView,
    RecentDealsAPIView,
    TeamActivityAPIView,
)

urlpatterns = [
    path('stats/', DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    path('charts/', DashboardChartsAPIView.as_view(), name='dashboard-charts'),
    path('recent-leads/', RecentLeadsAPIView.as_view(), name='dashboard-recent-leads'),
    path('activities/', ActivityStreamAPIView.as_view(), name='dashboard-activities'),
    path('tasks/', UpcomingTasksAPIView.as_view(), name='dashboard-tasks'),
    path('tasks/<int:pk>/toggle/', TaskToggleAPIView.as_view(), name='dashboard-task-toggle'),
    path('recent-deals/', RecentDealsAPIView.as_view(), name='dashboard-recent-deals'),
    path('team/', TeamActivityAPIView.as_view(), name='dashboard-team'),
]
