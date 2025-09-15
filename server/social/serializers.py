from rest_framework import serializers
from .models import Follow
from users.serializers import UserListSerializer


class FollowSerializer(serializers.ModelSerializer):
    follower = UserListSerializer(read_only=True)
    following = UserListSerializer(read_only=True)
    
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['follower', 'created_at']


class FollowCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['following']
