from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from .models import User
from .serializers import (
    UserSerializer,
    LoginSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['email'] = user.email
    refresh['role'] = user.role
    refresh['full_name'] = user.full_name
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class LoginAPIView(APIView):
    """
    POST /api/accounts/login/
    Secure authentication issuing JWT tokens and optional HttpOnly cookies.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        remember_me = serializer.validated_data.get('remember_me', False)

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data

        response = Response(
            {
                'message': 'Login successful.',
                'user': user_data,
                'tokens': tokens,
            },
            status=status.HTTP_200_OK
        )

        # Secure token cookies (HttpOnly)
        max_age_refresh = 86400 * 30 if remember_me else 86400 * 7
        response.set_cookie(
            key='refresh_token',
            value=tokens['refresh'],
            httponly=True,
            secure=getattr(settings, 'SESSION_COOKIE_SECURE', False),
            samesite='Lax',
            max_age=max_age_refresh,
            path='/api/accounts/'
        )
        response.set_cookie(
            key='access_token',
            value=tokens['access'],
            httponly=True,
            secure=getattr(settings, 'SESSION_COOKIE_SECURE', False),
            samesite='Lax',
            max_age=3600 * 2,
            path='/'
        )

        return response


class RefreshTokenAPIView(APIView):
    """
    POST /api/accounts/refresh/
    Refresh JWT access token from cookie or request body.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token') or request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            new_access = str(token.access_token)

            response = Response(
                {
                    'access': new_access,
                    'message': 'Token refreshed successfully.'
                },
                status=status.HTTP_200_OK
            )
            response.set_cookie(
                key='access_token',
                value=new_access,
                httponly=True,
                secure=getattr(settings, 'SESSION_COOKIE_SECURE', False),
                samesite='Lax',
                max_age=3600 * 2,
                path='/'
            )
            return response
        except Exception as e:
            return Response(
                {'error': 'Invalid or expired refresh token.'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutAPIView(APIView):
    """
    POST /api/accounts/logout/
    Clear authentication cookies and invalidate tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token') or request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        response = Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token', path='/')
        response.delete_cookie('refresh_token', path='/api/accounts/')
        return response


class UserProfileAPIView(APIView):
    """
    GET /api/accounts/profile/
    PATCH /api/accounts/profile/
    Retrieve or update currently authenticated user profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class ForgotPasswordAPIView(APIView):
    """
    POST /api/accounts/forgot-password/
    Send password reset instructions.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        # In production this emails a reset link. For Phase 1 we verify existence & provide test token.
        user_exists = User.objects.filter(email=email).exists()
        return Response(
            {
                'message': 'If an account exists with this email, password reset instructions have been sent.',
                'email': email,
                'reset_token': 'demo-reset-token-r4t' if user_exists else None
            },
            status=status.HTTP_200_OK
        )


class ResetPasswordAPIView(APIView):
    """
    POST /api/accounts/reset-password/
    Confirm and set new password.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            return Response(
                {'message': 'Password has been reset successfully. You may now log in.'},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid request.'},
                status=status.HTTP_400_BAD_REQUEST
            )
