from rest_framework import serializers
from .models import Notification
from users.serializers import UserListSerializer
from posts.serializers import PostSerializer


class NotificationSerializer(serializers.ModelSerializer):
    sender = UserListSerializer(read_only=True)
    post = PostSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'sender', 'notification_type', 'post', 
                 'message', 'is_read', 'created_at']
        read_only_fields = ['recipient', 'sender', 'created_at']
