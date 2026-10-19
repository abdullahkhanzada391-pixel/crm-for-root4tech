from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

class UserManager(BaseUserManager):
    """Custom user manager supporting email-based authentication."""

    def create_user(self, email, full_name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, full_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    ROOT 4 TECH Custom User Model.
    Designed for Phase 1 to support all future CRM and operations phases.
    """

    class Role(models.TextChoices):
        ADMIN = 'Admin', 'Admin'
        MARKETING_MANAGER = 'Marketing Manager', 'Marketing Manager'
        SALES_AGENT = 'Sales Agent', 'Sales Agent'
        DEVELOPER = 'Developer', 'Developer'
        VIDEO_EDITOR = 'Video Editor', 'Video Editor'

    full_name = models.CharField(max_length=255, verbose_name='Full Name')
    email = models.EmailField(unique=True, verbose_name='Email Address')
    phone = models.CharField(max_length=30, blank=True, null=True, verbose_name='Phone Number')
    role = models.CharField(
        max_length=50,
        choices=Role.choices,
        default=Role.SALES_AGENT,
        verbose_name='System Role'
    )
    department = models.CharField(
        max_length=100,
        default='Operations',
        verbose_name='Department'
    )
    avatar_url = models.URLField(blank=True, null=True, verbose_name='Avatar Image URL')
    
    is_active = models.BooleanField(default=True, verbose_name='Active')
    is_staff = models.BooleanField(default=False, verbose_name='Staff Status')
    date_joined = models.DateTimeField(default=timezone.now, verbose_name='Date Joined')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'r4t_users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return f'{self.full_name} ({self.email}) - {self.role}'
