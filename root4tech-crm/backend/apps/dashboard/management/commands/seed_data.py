from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User
from apps.dashboard.models import Lead, Deal, Project, Task, ActivityLog
from apps.notifications.models import Notification

class Command(BaseCommand):
    help = 'Seeds realistic ROOT 4 TECH CRM data for Phase 1'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding ROOT 4 TECH CRM data...'))

        # 1. Create Users
        admin_user, _ = User.objects.get_or_create(
            email='admin@root4tech.com',
            defaults={
                'full_name': 'Admin Root4Tech',
                'role': User.Role.ADMIN,
                'department': 'Executive',
                'is_staff': True,
                'is_superuser': True,
                'phone': '+1 (555) 019-2834',
                'avatar_url': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
            }
        )
        admin_user.set_password('Root4Tech2025!')
        admin_user.save()

        sarah, _ = User.objects.get_or_create(
            email='sarah.jenkins@root4tech.com',
            defaults={
                'full_name': 'Sarah Jenkins',
                'role': User.Role.SALES_AGENT,
                'department': 'Operations',
                'phone': '+1 (555) 234-5678',
                'avatar_url': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
            }
        )
        sarah.set_password('Root4Tech2025!')
        sarah.save()

        alex, _ = User.objects.get_or_create(
            email='alex.rivera@root4tech.com',
            defaults={
                'full_name': 'Alex Rivera',
                'role': User.Role.DEVELOPER,
                'department': 'Engineering',
                'phone': '+1 (555) 345-6789',
                'avatar_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
            }
        )
        alex.set_password('Root4Tech2025!')
        alex.save()

        elena, _ = User.objects.get_or_create(
            email='elena.morales@root4tech.com',
            defaults={
                'full_name': 'Elena Morales',
                'role': User.Role.MARKETING_MANAGER,
                'department': 'Growth & Marketing',
                'phone': '+1 (555) 456-7890',
                'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
            }
        )
        elena.set_password('Root4Tech2025!')
        elena.save()
        self.stdout.write(self.style.SUCCESS('Users created/verified.'))

        # 2. Create Leads
        leads_data = [
            {
                'organization': 'Apex Healthtech',
                'scope': 'Custom EHR Portal',
                'value': 65000.00,
                'source': Lead.Source.INBOUND_WEB,
                'status': Lead.Status.QUALIFIED,
                'assignee': alex,
                'contact_name': 'Dr. Robert Chen',
                'contact_email': 'rchen@apexhealth.io',
            },
            {
                'organization': 'NexaPay FinTech',
                'scope': 'PCI-DSS Cloud Migration',
                'value': 110000.00,
                'source': Lead.Source.LINKEDIN_ADS,
                'status': Lead.Status.PROPOSAL,
                'assignee': sarah,
                'contact_name': 'David Vance',
                'contact_email': 'dvance@nexapay.com',
            },
            {
                'organization': 'Orbit Logistics',
                'scope': 'Fleet IoT Dashboard',
                'value': 42000.00,
                'source': Lead.Source.ORGANIC_SEARCH,
                'status': Lead.Status.NEW,
                'assignee': elena,
                'contact_name': 'Marcus Brody',
                'contact_email': 'mbrody@orbitlogistics.com',
            },
            {
                'organization': 'Kinetix AI',
                'scope': 'Model Inference Pipeline',
                'value': 95000.00,
                'source': Lead.Source.REFERRAL,
                'status': Lead.Status.WON,
                'assignee': sarah,
                'contact_name': 'Claire Sterling',
                'contact_email': 'csterling@kinetix.ai',
            },
            {
                'organization': 'Strata Real Estate',
                'scope': 'PropTech Mobile App',
                'value': 38000.00,
                'source': Lead.Source.INBOUND_WEB,
                'status': Lead.Status.CONTACTED,
                'assignee': sarah,
                'contact_name': 'Jason Miller',
                'contact_email': 'jmiller@stratareal.com',
            },
        ]

        for ld in leads_data:
            Lead.objects.get_or_create(
                organization=ld['organization'],
                defaults=ld
            )

        self.stdout.write(self.style.SUCCESS('Leads created/verified.'))

        # 3. Create Deals
        deals_data = [
            {
                'name': 'PCI-DSS Cloud Migration',
                'organization': 'NexaPay FinTech',
                'value': 110000.00,
                'stage': Deal.Stage.PROPOSAL_SENT,
                'probability': 75,
                'assignee': sarah,
            },
            {
                'name': 'Model Inference Pipeline',
                'organization': 'Kinetix AI',
                'value': 95000.00,
                'stage': Deal.Stage.WON,
                'probability': 100,
                'assignee': sarah,
            },
            {
                'name': 'Custom EHR Portal',
                'organization': 'Apex Healthtech',
                'value': 65000.00,
                'stage': Deal.Stage.NEGOTIATION,
                'probability': 85,
                'assignee': alex,
            },
            {
                'name': 'Fleet IoT Dashboard',
                'organization': 'Orbit Logistics',
                'value': 42000.00,
                'stage': Deal.Stage.DISCOVERY,
                'probability': 40,
                'assignee': elena,
            },
        ]

        for dd in deals_data:
            Deal.objects.get_or_create(name=dd['name'], defaults=dd)

        # 4. Create Projects
        projects_data = [
            {'name': 'Cloud Infrastructure Overhaul', 'client_name': 'NexaPay FinTech', 'status': Project.Status.IN_PROGRESS, 'progress_percent': 65},
            {'name': 'Inference Serving API v2', 'client_name': 'Kinetix AI', 'status': Project.Status.IN_PROGRESS, 'progress_percent': 40},
            {'name': 'Telehealth Video Architecture', 'client_name': 'Apex Healthtech', 'status': Project.Status.PLANNING, 'progress_percent': 15},
        ]
        for pd in projects_data:
            Project.objects.get_or_create(name=pd['name'], defaults=pd)

        # 5. Create Tasks
        tasks_data = [
            {'title': 'Client discovery call with CTO', 'organization': 'Apex Healthtech', 'due_text': 'Today 2:30 PM', 'priority': Task.Priority.HIGH, 'assigned_to': sarah},
            {'title': 'Send revised SOW & Milestones', 'organization': 'NexaPay FinTech', 'due_text': 'Tomorrow 11:00 AM', 'priority': Task.Priority.MED, 'assigned_to': sarah},
            {'title': 'Sprint review for Cloud Architecture', 'organization': 'Engineering Sync', 'due_text': 'Jun 18 · 10:00 AM', 'priority': Task.Priority.STANDARD, 'assigned_to': alex},
        ]
        for td in tasks_data:
            Task.objects.get_or_create(title=td['title'], defaults=td)

        # 6. Create Activity Logs
        activities_data = [
            {
                'user_name': 'Sarah J.',
                'action': 'updated deal stage for',
                'target': 'NexaPay FinTech',
                'target_highlight': 'Proposal',
                'detail': 'Automated webhook',
                'event_type': ActivityLog.EventType.STAGE_CHANGE,
            },
            {
                'user_name': 'API Webhook',
                'action': 'New inbound inquiry from',
                'target': 'Orbit Logistics',
                'detail': 'Form #841',
                'event_type': ActivityLog.EventType.INBOUND,
            },
            {
                'user_name': 'DocuSign',
                'action': 'Contract signed by',
                'target': 'Kinetix AI',
                'target_highlight': '$95,000',
                'detail': 'Enterprise agreement',
                'event_type': ActivityLog.EventType.CONTRACT,
            },
            {
                'user_name': 'Automation Hub',
                'action': 'Automated email sequence sent to',
                'target': '14 leads',
                'detail': 'SaaS Tech Outreach v2',
                'event_type': ActivityLog.EventType.SEQUENCE,
            },
        ]
        for ad in activities_data:
            ActivityLog.objects.get_or_create(
                user_name=ad['user_name'],
                action=ad['action'],
                target=ad['target'],
                defaults=ad
            )

        # 7. Create Notifications
        notifs_data = [
            {'title': 'New Lead Registered', 'message': 'Orbit Logistics submitted an API RFP form.', 'category': Notification.Category.LEAD},
            {'title': 'Deal Stage Updated', 'message': 'NexaPay FinTech moved to Proposal stage ($110,000).', 'category': Notification.Category.DEAL},
            {'title': 'Task Deadline Today', 'message': 'Client discovery call with CTO at 2:30 PM.', 'category': Notification.Category.TASK},
        ]
        for nd in notifs_data:
            Notification.objects.get_or_create(title=nd['title'], defaults=nd)

        self.stdout.write(self.style.SUCCESS('Successfully seeded ROOT 4 TECH CRM data!'))
