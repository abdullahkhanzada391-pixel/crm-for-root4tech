from django.contrib import admin
from .models import Lead, Deal, Project, Task, ActivityLog

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('organization', 'scope', 'value', 'source', 'status', 'assignee', 'created_at')
    list_filter = ('status', 'source')
    search_fields = ('organization', 'scope', 'contact_name', 'contact_email')

@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'value', 'stage', 'probability', 'expected_close_date')
    list_filter = ('stage',)
    search_fields = ('name', 'organization')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'client_name', 'status', 'progress_percent', 'deadline')
    list_filter = ('status',)
    search_fields = ('name', 'client_name')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'organization', 'due_text', 'priority', 'is_completed')
    list_filter = ('priority', 'is_completed')
    search_fields = ('title', 'organization')

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'action', 'target', 'event_type', 'created_at')
    list_filter = ('event_type',)
    search_fields = ('user_name', 'action', 'target', 'detail')
