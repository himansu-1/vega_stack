from django.utils import timezone
from rest_framework import serializers

from .pagination import CustomUserPagination
from .models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username_or_email = data.get("username_or_email")
        password = data.get("password")

        user = User.objects.filter(email=username_or_email).first() or \
               User.objects.filter(username=username_or_email).first()

        if user and user.check_password(password):
            if not user.is_active:
                raise serializers.ValidationError("Account is inactive.")

            refresh = RefreshToken.for_user(user)
            user.last_login = timezone.now()
            user.save()

            return {
                "refresh": str(refresh),
                "token": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "last_login": user.last_login
                }
            }

        raise serializers.ValidationError("Invalid credentials.")

class UserEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'password',
                  'is_active', 'role', 'avatar_url', 'website', 'location',
                  'followers_count', 'following_count', 'posts_count', 'bio', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
        return super().update(instance, validated_data)

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'avatar_url', 'website', 'location', 'followers_count', 'following_count', 'posts_count', 'bio', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }
    
    # pagination

    # def update(self, instance, validated_data):
    #     if 'password' in validated_data:
    #         instance.set_password(validated_data.pop('password'))
    #     return super().update(instance, validated_data)

class UserListPaginatedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'avatar_url', 'website', 'location', 'followers_count', 'following_count', 'posts_count', 'bio', 'is_active']

class UserWithFollowStatusSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'avatar_url', 'website', 'location', 'followers_count', 'following_count', 'posts_count', 'bio', 'is_active', 'is_following', 'date_joined', 'last_login']
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from social.models import Follow
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False

class UserMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'avatar_url', 'website', 'location', 'followers_count', 'following_count', 'posts_count', 'bio', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }