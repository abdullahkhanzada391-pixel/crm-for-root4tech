from django.urls import path
from .views import (
    LoginAPIView,
    RefreshTokenAPIView,
    LogoutAPIView,
    UserProfileAPIView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
)

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='auth-login'),
    path('refresh/', RefreshTokenAPIView.as_view(), name='auth-refresh'),
    path('logout/', LogoutAPIView.as_view(), name='auth-logout'),
    path('profile/', UserProfileAPIView.as_view(), name='auth-profile'),
    path('forgot-password/', ForgotPasswordAPIView.as_view(), name='auth-forgot-password'),
    path('reset-password/', ResetPasswordAPIView.as_view(), name='auth-reset-password'),
]
