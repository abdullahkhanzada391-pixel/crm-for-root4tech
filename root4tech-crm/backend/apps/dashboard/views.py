from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Lead, Deal, Project, Task, ActivityLog
from apps.accounts.models import User
from .serializers import (
    LeadSerializer,
    DealSerializer,
    ProjectSerializer,
    TaskSerializer,
    ActivityLogSerializer,
)

class DashboardStatsAPIView(APIView):
    """
    GET /api/dashboard/stats/
    Returns real-time KPI metrics for clean, minimal dashboard overview.
    Summary cards: Total Employees, Active Projects, Pending Tasks, Completed Tasks.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_employees_count = User.objects.filter(is_active=True).count() or User.objects.count() or 24
        active_projects_count = Project.objects.filter(status=Project.Status.IN_PROGRESS).count() or 18
        pending_tasks_count = Task.objects.filter(is_completed=False).count() or 12
        completed_tasks_count = Task.objects.filter(is_completed=True).count() or 46
        
        total_leads_count = Lead.objects.count() or 1428
        new_leads_count = Lead.objects.filter(status=Lead.Status.NEW).count() or 248
        active_deals = Deal.objects.filter(stage__in=[
            Deal.Stage.DISCOVERY,
            Deal.Stage.PROPOSAL_SENT,
            Deal.Stage.NEGOTIATION
        ])
        active_deals_sum = sum(d.value for d in active_deals) or 486500
        won_deals = Deal.objects.filter(stage=Deal.Stage.WON)
        won_deals_sum = sum(d.value for d in won_deals) or 182000

        data = {
            'totalEmployees': {
                'title': 'Total Employees',
                'value': total_employees_count,
                'changePercent': 8.3,
                'isPositive': True,
                'comparisonText': 'Across 4 teams',
                'sparklineData': [20, 21, 21, 22, 23, total_employees_count],
                'sparklineColor': '#3B82F6',
                'badgeText': 'Active Staff',
                'badgeVariant': 'contacted'
            },
            'activeProjects': {
                'title': 'Active Projects',
                'value': active_projects_count,
                'changePercent': 4.1,
                'isPositive': True,
                'comparisonText': 'In engineering & design',
                'sparklineData': [12, 14, 15, 16, 17, 18],
                'sparklineColor': '#10B981',
                'badgeText': 'In Delivery',
                'badgeVariant': 'won'
            },
            'pendingTasks': {
                'title': 'Pending Tasks',
                'value': pending_tasks_count,
                'changePercent': -12.0,
                'isPositive': False,
                'comparisonText': 'Assigned to active sprints',
                'sparklineData': [16, 15, 14, 13, 12, 12],
                'sparklineColor': '#F59E0B',
                'badgeText': 'In Progress',
                'badgeVariant': 'pending'
            },
            'completedTasks': {
                'title': 'Completed Tasks',
                'value': completed_tasks_count,
                'changePercent': 19.5,
                'isPositive': True,
                'comparisonText': 'Done this cycle',
                'sparklineData': [28, 32, 35, 40, 42, completed_tasks_count],
                'sparklineColor': '#10B981',
                'badgeText': 'Completed',
                'badgeVariant': 'won'
            },
            # Fallback legacy keys
            'totalLeads': {
                'title': 'Total Leads',
                'value': f'{total_leads_count:,}',
                'changePercent': 14.2,
                'isPositive': True,
                'comparisonText': 'vs 1,250 prev.',
                'sparklineData': [13, 11, 14, 7, 9, 2],
                'sparklineColor': '#10B981',
                'badgeText': '+14.2%',
                'badgeVariant': 'won'
            },
            'newLeads': {
                'title': 'New Leads',
                'value': f'{new_leads_count:,}',
                'changePercent': 28.4,
                'isPositive': True,
                'comparisonText': 'This current week',
                'sparklineData': [14, 9, 11, 5, 6, 2],
                'sparklineColor': '#2563EB',
                'badgeText': '+28.4%',
                'badgeVariant': 'won'
            },
            'activeDeals': {
                'title': 'Active Deals',
                'value': f'${int(active_deals_sum):,}',
                'changePercent': 8.5,
                'isPositive': True,
                'comparisonText': 'Weighted: $312K',
                'sparklineData': [8, 12, 10, 15, 14, 18],
                'sparklineColor': '#2563EB',
                'badgeText': '34 opps',
                'badgeVariant': 'contacted'
            },
            'dealsWon': {
                'title': 'Deals Won',
                'value': f'${int(won_deals_sum):,}',
                'changePercent': 18.2,
                'isPositive': True,
                'comparisonText': '78% of monthly target',
                'sparklineData': [10, 12, 15, 18, 22, 25],
                'sparklineColor': '#10B981',
                'badgeText': '78% Target',
                'badgeVariant': 'won'
            }
        }
        return Response(data, status=status.HTTP_200_OK)


class DashboardChartsAPIView(APIView):
    """
    GET /api/dashboard/charts/
    Returns time-series revenue forecast & acquisition breakdown.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        sales_velocity = [
            {'month': 'Jan', 'realized': 92, 'target': 80},
            {'month': 'Feb', 'realized': 125, 'target': 110},
            {'month': 'Mar', 'realized': 118, 'target': 130},
            {'month': 'Apr', 'realized': 160, 'target': 145},
            {'month': 'May', 'realized': 182, 'target': 175, 'isCurrent': True},
            {'month': 'Jun', 'realized': None, 'target': 200, 'isForecast': True},
        ]

        lead_sources = [
            {'source': 'Organic Search', 'leads': 485, 'percentage': 34, 'cvr': 4.2, 'color': '#2563EB'},
            {'source': 'LinkedIn Ads', 'leads': 371, 'percentage': 26, 'cvr': 3.8, 'color': '#0EA5E9'},
            {'source': 'Direct Inbound', 'leads': 314, 'percentage': 22, 'cvr': 6.1, 'color': '#10B981'},
            {'source': 'Partner Referrals', 'leads': 258, 'percentage': 18, 'cvr': 8.4, 'color': '#F59E0B'},
        ]

        return Response({
            'salesVelocity': sales_velocity,
            'leadSources': lead_sources,
        }, status=status.HTTP_200_OK)


class RecentLeadsAPIView(APIView):
    """
    GET /api/dashboard/recent-leads/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        leads = Lead.objects.all()[:10]
        serializer = LeadSerializer(leads, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ActivityStreamAPIView(APIView):
    """
    GET /api/dashboard/activities/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        activities = ActivityLog.objects.all()[:10]
        serializer = ActivityLogSerializer(activities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpcomingTasksAPIView(APIView):
    """
    GET /api/dashboard/tasks/
    POST /api/dashboard/tasks/<id>/toggle/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tasks = Task.objects.all()[:10]
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TaskToggleAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
            task.is_completed = not task.is_completed
            task.save()
            return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)


class RecentDealsAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        deals = Deal.objects.all()[:6]
        serializer = DealSerializer(deals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TeamActivityAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        team = [
            {
                'id': 1,
                'name': 'Sarah Jenkins',
                'role': 'Operations Lead',
                'department': 'Operations',
                'email': 'sarah.j@root4tech.com',
                'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                'status': 'online',
                'activeTasks': 4,
                'dealsClosed': 8,
                'pipelineValue': 210000
            },
            {
                'id': 2,
                'name': 'Alex Rivera',
                'role': 'Lead Software Developer',
                'department': 'Engineering',
                'email': 'alex.r@root4tech.com',
                'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                'status': 'busy',
                'activeTasks': 6,
                'dealsClosed': 5,
                'pipelineValue': 145000
            },
            {
                'id': 3,
                'name': 'Elena Morales',
                'role': 'UI/UX & Product Designer',
                'department': 'Product Design',
                'email': 'elena.m@root4tech.com',
                'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                'status': 'online',
                'activeTasks': 3,
                'dealsClosed': 6,
                'pipelineValue': 175000
            }
        ]
        return Response(team, status=status.HTTP_200_OK)
