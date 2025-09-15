from rest_framework import generics, status, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import InMemoryUploadedFile
from utils.cloudinary_utils import delete_cloudinary_image

from .models import Post, Comment, Like
from .serializers import PostSerializer, PostCreateSerializer, CommentSerializer, CommentCreateSerializer, LikeSerializer
from social.models import Follow
from notifications.models import Notification
import cloudinary.uploader

User = get_user_model()


class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        return Post.objects.filter(is_active=True).select_related('author').prefetch_related('likes')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostCreateSerializer
        return PostSerializer
    
    def handle_image_upload(self, image_file: InMemoryUploadedFile):
        # Validate file size (2MB limit)
        if image_file.size > 2 * 1024 * 1024:
            raise ValueError("File size too large. Maximum size is 2MB.")
        
        # Validate file type
        valid_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if image_file.content_type not in valid_types:
            raise ValueError("Only JPG, JPEG, PNG, or GIF files are allowed")

        # Upload to Cloudinary
        try:
            result = cloudinary.uploader.upload(
                image_file,
                folder="posts",  # Organize uploads in a folder
                transformation=[
                    {'width': 800, 'height': 600, 'crop': 'limit', 'quality': 'auto'}
                ]
            )
            print("Post image upload result:", result)
            return result['secure_url']
        except Exception as e:
            print("Post image upload error:", str(e))
            raise ValueError(f"Failed to upload image: {str(e)}")
    
    def create(self, request, *args, **kwargs):
        # Use PostCreateSerializer for validation
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create the post
        data = serializer.validated_data.copy()
        
        # Handle image upload
        try:
            if 'image' in request.FILES:
                image_url = self.handle_image_upload(request.FILES['image'])
                data['image_url'] = image_url
        except ValueError as e:
            raise serializers.ValidationError({"image": str(e)})
        
        post = serializer.save(author=request.user, **data)
        
        # Update user's post count by counting actual posts (more reliable)
        actual_count = Post.objects.filter(author=request.user, is_active=True).count()
        request.user.posts_count = actual_count
        request.user.save()
        
        # Return the full post data with author information using PostSerializer
        response_serializer = PostSerializer(post, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        # For GET requests, only show active posts
        # For PUT/PATCH/DELETE requests, allow access to all posts (for editing/deleting)
        if self.request.method == 'GET':
            return Post.objects.filter(is_active=True).select_related('author').prefetch_related('likes')
        else:
            return Post.objects.select_related('author').prefetch_related('likes')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PostCreateSerializer
        return PostSerializer
    
    def handle_image_upload(self, image_file: InMemoryUploadedFile):
        # Validate file size (1.5MB limit)
        if image_file.size > 1.5 * 1024 * 1024:
            raise ValueError("File size must be under 1.5MB")
        
        # Validate file type
        valid_types = ['image/jpeg', 'image/png', 'image/jpg']
        if image_file.content_type not in valid_types:
            raise ValueError("Only JPG, JPEG, or PNG files are allowed")
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(image_file)
        return result['secure_url']
    
    def perform_update(self, serializer):
        # Allow post author or admin to edit posts
        if serializer.instance.author != self.request.user and self.request.user.role != 'admin':
            raise permissions.PermissionDenied("You can only edit your own posts.")
        
        # Store old image URL before updating
        old_image_url = serializer.instance.image_url
        
        data = serializer.validated_data.copy()
        
        # Handle FormData fields
        if 'category' in self.request.data:
            data['category'] = self.request.data['category']
        if 'is_active' in self.request.data:
            data['is_active'] = self.request.data['is_active'] == 'true'
        
        # Handle image upload or removal
        try:
            if 'image' in self.request.FILES:
                # New image uploaded
                image_url = self.handle_image_upload(self.request.FILES['image'])
                data['image_url'] = image_url
                
                # Delete old image from Cloudinary
                if old_image_url:
                    delete_cloudinary_image(old_image_url)
            elif 'remove_image' in self.request.data and self.request.data['remove_image'] == 'true':
                # Image removal requested
                data['image_url'] = None
                
                # Delete old image from Cloudinary
                if old_image_url:
                    delete_cloudinary_image(old_image_url)
        except ValueError as e:
            raise serializers.ValidationError({"image": str(e)})
        
        serializer.save(**data)
    
    def perform_destroy(self, instance):
        # Allow post author or admin to delete posts
        if instance.author != self.request.user and self.request.user.role != 'admin':
            raise permissions.PermissionDenied("You can only delete your own posts.")
        
        # Store author reference before deletion
        author = instance.author
        
        # Delete the image from Cloudinary before deleting the post
        if instance.image_url:
            delete_cloudinary_image(instance.image_url)
        
        # Actually delete the post (not just deactivate)
        instance.delete()
        
        # Update user's post count by counting actual posts (more reliable)
        actual_count = Post.objects.filter(author=author, is_active=True).count()
        author.posts_count = actual_count
        author.save()


class FeedView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Get users that current user follows
        following_users = Follow.objects.filter(follower=self.request.user).values_list('following', flat=True)
        
        # If user doesn't follow anyone, show all active posts
        if not following_users:
            queryset = Post.objects.filter(
                is_active=True
            ).select_related('author').prefetch_related('likes').order_by('-created_at')
        else:
            # Get posts from followed users + own posts
            queryset = Post.objects.filter(
                Q(author__in=following_users) | Q(author=self.request.user),
                is_active=True
            ).select_related('author').prefetch_related('likes').order_by('-created_at')
        
        return queryset


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id, is_active=True).select_related('author')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer
    
    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs['post_id'], is_active=True)
        serializer.save(author=self.request.user, post=post)
        
        # Update post comment count
        post.comment_count += 1
        post.save()
        
        # Create notification for post author (if not the same user)
        if post.author != self.request.user:
            Notification.objects.create(
                recipient=post.author,
                sender=self.request.user,
                notification_type='comment',
                post=post,
                message=f"{self.request.user.username} commented on your post"
            )


class CommentDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Comment.objects.filter(is_active=True).select_related('author')
    
    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own comments.")
        instance.is_active = False
        instance.save()
        
        # Update post comment count
        instance.post.comment_count -= 1
        instance.post.save()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def like_post(request, post_id):
    post = get_object_or_404(Post, id=post_id, is_active=True)
    
    # Check if already liked
    like, created = Like.objects.get_or_create(user=request.user, post=post)
    
    if created:
        # Update post like count
        post.like_count += 1
        post.save()
        
        # Create notification for post author (if not the same user)
        if post.author != request.user:
            Notification.objects.create(
                recipient=post.author,
                sender=request.user,
                notification_type='like',
                post=post,
                message=f"{request.user.username} liked your post"
            )
        
        return Response({"message": "Post liked successfully"}, status=status.HTTP_201_CREATED)
    else:
        return Response({"message": "Post already liked"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def unlike_post(request, post_id):
    post = get_object_or_404(Post, id=post_id, is_active=True)
    
    try:
        like = Like.objects.get(user=request.user, post=post)
        like.delete()
        
        # Update post like count
        post.like_count -= 1
        post.save()
        
        return Response({"message": "Post unliked successfully"}, status=status.HTTP_200_OK)
    except Like.DoesNotExist:
        return Response({"message": "Post not liked"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def like_status(request, post_id):
    post = get_object_or_404(Post, id=post_id, is_active=True)
    is_liked = Like.objects.filter(user=request.user, post=post).exists()
    
    return Response({"is_liked": is_liked}, status=status.HTTP_200_OK)