from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'email',
            'phone',
            'role',
            'department',
            'avatar_url',
            'is_active',
            'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    remember_me = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            if not user.is_active:
                raise serializers.ValidationError('This account is disabled.')
        else:
            raise serializers.ValidationError('Both email and password are required.')

        attrs['user'] = user
        return attrs


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['full_name', 'phone', 'department', 'avatar_url']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, min_length=8, write_only=True)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    token = serializers.CharField(required=False, allow_blank=True)
    new_password = serializers.CharField(required=True, min_length=8)
