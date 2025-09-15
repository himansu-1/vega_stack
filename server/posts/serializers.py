from rest_framework import serializers
from .models import Post, Comment, Like
from users.serializers import UserListSerializer


class PostSerializer(serializers.ModelSerializer):
    author = UserListSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'content', 'author', 'created_at', 'updated_at', 
                 'image_url', 'category', 'is_active', 'like_count', 
                 'comment_count', 'is_liked']
        read_only_fields = ['author', 'created_at', 'updated_at', 'like_count', 'comment_count']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content', 'image_url', 'category', 'is_active']
    
    def validate_content(self, value):
        if len(value) > 280:
            raise serializers.ValidationError("Content cannot exceed 280 characters.")
        return value


class CommentSerializer(serializers.ModelSerializer):
    author = UserListSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at', 'is_active']
        read_only_fields = ['author', 'created_at']
    
    def validate_content(self, value):
        if len(value) > 200:
            raise serializers.ValidationError("Content cannot exceed 200 characters.")
        return value


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content']
    
    def validate_content(self, value):
        if len(value) > 200:
            raise serializers.ValidationError("Content cannot exceed 200 characters.")
        return value


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['user', 'created_at']

class PostListSerializer(serializers.ModelSerializer):
    author = UserListSerializer(read_only=True)
    class Meta:
        model = Post
        fields = ['id', 'content', 'author', 'created_at', 'updated_at', 
                 'image_url', 'category', 'is_active', 'like_count', 
                 'comment_count']
        read_only_fields = ['author', 'created_at', 'updated_at', 'like_count', 'comment_count']
