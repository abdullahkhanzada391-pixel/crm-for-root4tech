from rest_framework import serializers
from .models import Lead, Deal, Project, Task, ActivityLog

class LeadSerializer(serializers.ModelSerializer):
    initials = serializers.SerializerMethodField()
    initials_color = serializers.SerializerMethodField()
    assignee = serializers.SerializerMethodField()
    assignee_details = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = [
            'id',
            'organization',
            'scope',
            'value',
            'source',
            'status',
            'initials',
            'initials_color',
            'assignee',
            'assignee_details',
            'contact_name',
            'contact_email',
            'contact_phone',
            'created_at',
        ]

    def get_initials(self, obj):
        parts = obj.organization.split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[1][0]).upper()
        return obj.organization[:2].upper()

    def get_initials_color(self, obj):
        colors = ['text-primary', 'text-chart-2', 'text-chart-3', 'text-chart-4', 'text-chart-5']
        return colors[obj.id % len(colors)] if obj.id else 'text-primary'

    def get_assignee(self, obj):
        return self.get_assignee_details(obj)

    def get_assignee_details(self, obj):
        if obj.assignee:
            names = obj.assignee.full_name.split()
            initials = ''.join([n[0] for n in names[:2]]).upper()
            return {
                'name': obj.assignee.full_name,
                'initials': initials,
                'avatar': obj.assignee.avatar_url,
            }
        return {'name': 'Alex R.', 'initials': 'AR'}


class DealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deal
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'organization',
            'due_text',
            'priority',
            'is_completed',
            'created_at',
        ]


class ActivityLogSerializer(serializers.ModelSerializer):
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'user_name',
            'action',
            'target',
            'target_highlight',
            'detail',
            'event_type',
            'timestamp',
            'created_at',
        ]

    def get_timestamp(self, obj):
        from django.utils.timesince import timesince
        return f'{timesince(obj.created_at)} ago'
