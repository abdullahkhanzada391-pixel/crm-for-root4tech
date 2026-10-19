from django.db import models
from django.conf import settings
from django.utils import timezone

class Lead(models.Model):
    class Status(models.TextChoices):
        NEW = 'New', 'New'
        CONTACTED = 'Contacted', 'Contacted'
        QUALIFIED = 'Qualified', 'Qualified'
        PROPOSAL = 'Proposal', 'Proposal'
        WON = 'Won', 'Won'
        LOST = 'Lost', 'Lost'

    class Source(models.TextChoices):
        ORGANIC_SEARCH = 'Organic Search', 'Organic Search'
        LINKEDIN_ADS = 'LinkedIn Ads', 'LinkedIn Ads'
        DIRECT_INBOUND = 'Direct Inbound', 'Direct Inbound'
        PARTNER_REFERRALS = 'Partner Referrals', 'Partner Referrals'
        INBOUND_WEB = 'Inbound Web', 'Inbound Web'
        REFERRAL = 'Referral', 'Referral'

    organization = models.CharField(max_length=255)
    scope = models.CharField(max_length=255, help_text="e.g. Custom EHR Portal, Cloud Migration")
    value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    source = models.CharField(max_length=50, choices=Source.choices, default=Source.INBOUND_WEB)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.NEW)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_leads'
    )
    contact_name = models.CharField(max_length=255, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'r4t_leads'
        ordering = ['-value', '-created_at']

    def __str__(self):
        return f'{self.organization} - ${self.value} ({self.status})'


class Deal(models.Model):
    class Stage(models.TextChoices):
        DISCOVERY = 'Discovery', 'Discovery'
        PROPOSAL_SENT = 'Proposal Sent', 'Proposal Sent'
        NEGOTIATION = 'Negotiation', 'Negotiation'
        WON = 'Closed Won', 'Closed Won'
        LOST = 'Closed Lost', 'Closed Lost'

    name = models.CharField(max_length=255)
    organization = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=12, decimal_places=2)
    stage = models.CharField(max_length=50, choices=Stage.choices, default=Stage.DISCOVERY)
    probability = models.IntegerField(default=50, help_text="Percentage 0-100")
    expected_close_date = models.DateField(null=True, blank=True)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deals'
    )
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'r4t_deals'
        ordering = ['-value']

    def __str__(self):
        return f'{self.name} - ${self.value}'


class Project(models.Model):
    class Status(models.TextChoices):
        PLANNING = 'Planning', 'Planning'
        IN_PROGRESS = 'In Progress', 'In Progress'
        REVIEW = 'Review', 'Review'
        COMPLETED = 'Completed', 'Completed'

    name = models.CharField(max_length=255)
    client_name = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.IN_PROGRESS)
    progress_percent = models.IntegerField(default=0)
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'r4t_projects'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.client_name})'


class Task(models.Model):
    class Priority(models.TextChoices):
        HIGH = 'High', 'High'
        MED = 'Med', 'Med'
        STANDARD = 'Standard', 'Standard'

    title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255, blank=True)
    due_text = models.CharField(max_length=100, default='Tomorrow 11:00 AM')
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MED)
    is_completed = models.BooleanField(default=False)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'r4t_tasks'
        ordering = ['is_completed', '-created_at']

    def __str__(self):
        return f'{self.title} [{self.priority}]'


class ActivityLog(models.Model):
    class EventType(models.TextChoices):
        STAGE_CHANGE = 'stage_change', 'Deal Stage Changed'
        INBOUND = 'inbound', 'Inbound Inquiry'
        CONTRACT = 'contract', 'Contract Signed'
        SEQUENCE = 'sequence', 'Email Sequence'
        TASK = 'task', 'Task Update'

    user_name = models.CharField(max_length=255, default='System')
    action = models.CharField(max_length=255)
    target = models.CharField(max_length=255)
    target_highlight = models.CharField(max_length=255, blank=True)
    detail = models.CharField(max_length=255, blank=True)
    event_type = models.CharField(max_length=50, choices=EventType.choices, default=EventType.STAGE_CHANGE)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'r4t_activity_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user_name} {self.action} {self.target}'
