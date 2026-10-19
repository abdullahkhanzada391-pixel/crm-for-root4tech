from django.db import models
from django.conf import settings
from django.utils import timezone

class Notification(models.Model):
    class Category(models.TextChoices):
        LEAD = 'lead', 'New Lead'
        DEAL = 'deal', 'Deal Alert'
        TASK = 'task', 'Task Deadline'
        SYSTEM = 'system', 'System Notification'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    category = models.CharField(max_length=30, choices=Category.choices, default=Category.SYSTEM)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'r4t_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.category})'
